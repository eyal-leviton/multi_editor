# -*- coding: utf-8 -*-
import argparse
import base64
import contextlib
import Cookie
import errno
import os
import random
import socket
import subprocess
import sys
import time
import traceback
import urlparse

from . import constants
from . import util


# for debug
EYECATCHER = '-' * 10 + 'EYECATCHER' + '-' * 10 + '\r\n'
MIME_MAPPING = {
    'html': 'text/html',
    'png': 'image/png',
    'txt': 'text/plain',
}
HTML_STDR_SIZE = len('<HTML><BODY></BODY></HTML>')


def send_status(s, code, message, extra):
    util.send_all(
        s,
        (
            (
                '%s %s %s\r\n'
                'Content-Type: text/plain\r\n'
                '\r\n'
                'Error %s %s\r\n'
                '%s'
            ) % (
                constants.HTTP_SIGNATURE,
                code,
                message,
                code,
                message,
                extra,
            )
        ).encode('utf-8')
    )


def parse_args():
    """Parse program argument."""

    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--bind-address',
        default='0.0.0.0',
        help='Bind address, default: %(default)s',
    )
    parser.add_argument(
        '--bind-port',
        default=constants.DEFAULT_HTTP_PORT,
        type=int,
        help='Bind port, default: %(default)s',
    )
    parser.add_argument(
        '--base',
        default='.',
        help='Base directory to search fils in, default: %(default)s',
    )
    args = parser.parse_args()
    args.base = os.path.normpath(os.path.realpath(args.base))
    return args


def send_html(
    s,
    body='',
    status='200 OK',
    headers=[]
):
    util.send_all(
        s,
        (
            (
                '%s %s\r\n'
                'Content-Length: %s\r\n'
                'Content-Type: %s\r\n'
                'Cache-Control: no-cache, no-store, must-revalidate\r\n'
                'Pragma: no-cache\r\n'
                'Expires: 0\r\n'
                '%s'
                '\r\n'
                '<HTML><BODY>'
                '%s'
                '</BODY></HTML>'
            ) % (
                constants.HTTP_SIGNATURE,
                status,
                HTML_STDR_SIZE+len(body),
                MIME_MAPPING['html'],
                ''.join(headers),
                body,
            )
        ).encode('utf-8')
    )


def cookie_sep(cookies_str):
    cookies = {}
    for cookie in Cookie.BaseCookie(cookies_str).values():
        cookies[cookie.key] = cookie.value

    return cookies


def clock(s):
    body = time.strftime(
        "%Y-%m-%d %H:%M:%S",
        time.gmtime(),
    )
    send_html(s, body=body)


def mul(s, uri_parse):
    vals = urlparse.parse_qs(uri_parse.query)
    ans = int(vals['a'][0]) * int(vals['b'][0])
    body = str(ans)
    send_html(s, body=body)


def secret1(s, basic=''):
    if basic:
        user_pass = basic.split(':')
        if (
            len(user_pass) == 2 and
            user_pass[0] == 'user1' and
            user_pass[1] == 'pass1'
        ):

            body = 'welcome %s' % user_pass[0]
            send_html(s, body=body)

    else:
        send_html(
            s,
            status='401 Unauthorized',
            headers=['WWW-Authenticate: Basic realm="User Visible Realm"'],
        )


def counter(s, cookies={}):
    if 'count' not in cookies:
        count = 1
    else:
        count = int(cookies['count']) + 1

    body = str(count)
    header = 'Set-Cookie: count=%d\r\n' % count
    send_html(s, body=body, headers=[header])


def login(s, uri_parse, users):
    vals = urlparse.parse_qs(uri_parse.query)
    name, passward = vals['a'][0], vals['b'][0]
    headers = ['Location: http://localhost:8080/secret2\r\n']

    if (
        name == 'user1' and
        passward == 'pass1'
    ):
        rnd_id = random.randint(1000, 9999)
        headers.append('Set-Cookie: rnd_id=%d\r\n' % rnd_id)
        users[rnd_id] = name
    else:
        headers.append('Set-Cookie: rnd_id=0\r\n')

    send_html(
        s,
        status='301 Moved Permanently',
        headers=headers,
    )


def secret2(s, cookies, users):
    if 'rnd_id' in cookies and int(cookies['rnd_id']) in users:
        body = 'welcome user1'
    else:
        body = 'identifying went wrong'

    send_html(s, body=body)


def run_prog(s, uri_parse):
    to_run = [
        sys.executable,
        str(uri_parse.path)[1:],
    ]
    for arg in urlparse.parse_qs(uri_parse.query).values():
        to_run.append(arg[0])

    send_html(s, body=subprocess.check_output(to_run))


def set_content(rest):
    print rest


def main():
    args = parse_args()
    basic = ''
    users = {}
    cookies = {}

    with contextlib.closing(
        socket.socket(
            family=socket.AF_INET,
            type=socket.SOCK_STREAM,
        )
    ) as sl:
        sl.bind((args.bind_address, args.bind_port))
        sl.listen(10)
        while True:
            s, addr = sl.accept()
            with contextlib.closing(s):
                status_sent = False
                try:

                    rest = bytearray()

                    #
                    # Parse request line
                    #
                    req, rest = util.recv_line(s, rest)
                    req_comps = req.split(' ', 2)
                    if req_comps[2] != constants.HTTP_SIGNATURE:
                        raise RuntimeError('Not HTTP protocol')
                    if len(req_comps) != 3:
                        raise RuntimeError('Incomplete HTTP protocol')

                    method, uri, signature = req_comps
                    if method != 'GET' and method != 'POST':
                        raise RuntimeError(
                            "HTTP unsupported method '%s'" % method
                        )
                    #
                    # Create a file out of request uri.
                    # Be extra careful, it must not escape
                    # the base path.
                    #
                    # NOTICE: os.path.normpath cannot be used checkout:
                    # os.path.normpath(('/a/b', '/a/b1')
                    #
                    if not uri or uri[0] != '/':
                        raise RuntimeError("Invalid URI")

                    file_name = os.path.normpath(
                        os.path.join(
                            args.base,
                            uri[1:],
                        )
                    )

                    if file_name[:len(args.base) + 1] != os.path.join(
                        args.base,
                        '',
                    ):
                        raise RuntimeError("Malicious URI '%s'" % uri)

                    #
                    # Parse headers
                    #
                    for i in range(constants.MAX_NUMBER_OF_HEADERS):
                        line, rest = util.recv_line(s, rest)
                        if not line:
                            break
                        if line.find('Authorization: Basic') != -1:
                            basic = base64.b64decode(
                                line[len('Authorization: Basic'):],
                            )
                        elif line.find('Cookie: ') != -1:
                            cookies = cookie_sep(str(line))

                    else:
                        raise RuntimeError('Too many headers')

                    uri_parse = urlparse.urlparse(uri)

                    if uri_parse.path == '/clock':
                        clock(s)

                    elif uri_parse.path == '/mul':
                        mul(s, uri_parse)

                    elif uri_parse.path == '/secret1':
                        secret1(s, basic)

                    elif uri_parse.path == '/counter':
                        counter(s, cookies)

                    elif uri_parse.path == '/login':
                        login(s, uri_parse, users)

                    elif uri_parse.path == '/secret2':
                        secret2(s, cookies, users)

                    elif uri_parse.path[-3:] == '.py':
                        run_prog(s, uri_parse)

                    elif uri_parse.path == '/set':
                        set_content(rest)

                    else:
                        with open(file_name, 'rb') as f:

                            util.send_all(
                                s,
                                (
                                    (
                                        '%s 200 OK\r\n'
                                        'Content-Length: %s\r\n'
                                        'Content-Type: %s\r\n'
                                        '\r\n'
                                    ) % (
                                        constants.HTTP_SIGNATURE,
                                        os.fstat(f.fileno()).st_size,
                                        MIME_MAPPING.get(
                                            os.path.splitext(
                                                file_name
                                            )[1].lstrip('.'),
                                            'application/octet-stream',
                                        ),
                                    )
                                ).encode('utf-8')
                            )
                            #
                            # Send content
                            #
                            while True:
                                buf = f.read(constants.BLOCK_SIZE)
                                if not buf:
                                    break
                                util.send_all(s, buf)
                except IOError as e:
                    traceback.print_exc()
                    if not status_sent:
                        if e.errno == errno.ENOENT:
                            send_status(s, 404, 'File Not Found', e)
                        else:
                            send_status(s, 500, 'Internal Error', e)
                except Exception as e:
                    traceback.print_exc()
                    if not status_sent:
                        send_status(s, 500, 'Internal Error', e)

if __name__ == '__main__':
    main()

# vim: expandtab tabstop=4 shiftwidth=4
