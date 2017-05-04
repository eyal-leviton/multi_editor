# -*- coding: utf-8 -*-
import argparse
import base64
import contextlib
import Cookie
import errno
import json
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


MIME_MAPPING = {
    'html': 'text/html',
    'png': 'image/png',
    'txt': 'text/plain',
}
TIMEOUT = 0.05


class Content(object):
    def __init__(self):
        self.version = 0
        self.content = []

    def get_content(self, version):
        response = {
            'changed': False,
            'version': self.version,
            'content': None,
        }
        if self.version > version:
            response['content'] = '\\'.join(str(e) for e in self.content)
            response['changed'] = True
        return json.dumps(response)

    def set_char(self, c, i):
        if i >= 0 and i <= len(self.content):
            self.content.insert(i, c)
            self.version += 1

    def delete_char(self, i):
        if i > 0 and i < len(self.content) + 1:
            self.content.pop(i-1)
            self.version += 1


class Cursors(object):
    def __init__(self):
        self.cursors = {}
        self.colors = [
            'Blue',
            'Brown',
            'Orange',
            'Red',
            'Pink',
            'Yellow',
            'Black',
            'Green',
        ]
        self.used_colors = []

    def add_cursor(self, s):
        if len(self.colors) == 0:
            send_status(s, 403, 'Forbidden', 'server is full')
        elif s in self.cursors.keys():
            pass
        else:
            self.cursors[s] = [
                (
                    '<div id="%s" '
                    'class="cursor" '
                    'style="border-color: %s;">'
                    '</div>'
                ) % (
                    s,
                    self.colors[0]
                ),
                0,
            ]

            self.used_colors.append(self.colors.pop(0))

    def remove_cursor(self, s):
        self.cursors.pop(s, None)

    def get_cursors(self):
        return self.cursors


def send_status(s, code, message, extra):
    util.send_all(
        s,
        (
            (
                '%s %s %s\r\n'
                'Content-Type: text/plain\r\n'
                '\r\n'
                'Error %s %s\r\n'
            ) % (
                constants.HTTP_SIGNATURE,
                code,
                message,
                code,
                message,
            )
        ).encode('utf-8')
    )
    util.send_all(
        s,
        (
            '%s' % extra
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
        default=8080,
        type=int,
        help='Bind port, default: %(default)s',
    )
    parser.add_argument(
        '--base',
        default='multi_editor/www',
        help='Base directory to search files in, default: %(default)s',
    )
    args = parser.parse_args()
    args.base = os.path.normpath(os.path.realpath(args.base))
    return args

def set_uri(
    s,
    received,
    content,
):
    c, i, version = received.split('"')
    if c == '\b':
        content.delete_char(int(i))
    else:
        content.set_char(c, int(i))

    content_uri(
        s,
        received,
        content,
    )

def content_uri(
    s,
    received,
    content,
):
    c, i, version = received.split('"')
    version = int(version)
    util.send_all(
        s,
        (
            (
                '%s 200 OK\r\n'
                '\r\n'
                '%s'
            ) % (
                constants.HTTP_SIGNATURE,
                content.get_content(version),
            )
        ).encode('utf-8'),
    )

def main():
    args = parse_args()
    content = Content()
    cursors = Cursors()

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

                    if not uri or uri[0] != '/' or '\\' in uri:
                        raise RuntimeError("Invalid URI")

                    file_name = os.path.normpath(
                        '%s%s' % (
                            args.base,
                            os.path.normpath(str(uri)),
                        )
                    )

                    #
                    # Parse headers
                    #
                    headers = {
                        'Content-Length': None,
                    }
                    for i in range(constants.MAX_NUMBER_OF_HEADERS):
                        line, rest = util.recv_line(s, rest)
                        if not line:
                            break
                        k, v = util.parse_header(line)
                        if k in headers:
                            headers[k] = v
                    else:
                        raise RuntimeError('Too many headers')

                    #
                    # Receive content if available based on
                    # Content-Length header.
                    # We must receive content as remote is expected
                    # to read response only after it finished sending
                    # content.
                    #
                    received = ''
                    if headers['Content-Length'] is not None:
                        # Recv excacly what requested.
                        left_to_read = int(headers['Content-Length'])
                        while left_to_read > 0:
                            if not rest:
                                t = s.recv(constants.BLOCK_SIZE)
                                if not t:
                                    raise RuntimeError(
                                        'Disconnected while waiting for '
                                        'content'
                                    )
                                rest += t
                            buf, rest = (
                                rest[:left_to_read],
                                rest[left_to_read:],
                            )
                            received += buf
                            left_to_read -= len(buf)

                    if uri == '/set':
                        set_uri(
                            s,
                            received,
                            content,
                        )

                    elif uri == '/content':
                        content_uri(
                            s,
                            received,
                            content,
                        )

                    else:
                        with open(file_name, 'rb') as f:

                            #
                            # Send headers
                            #
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

                except util.DisconnectException:
                    pass

                except Exception as e:
                    traceback.print_exc()
                    if not status_sent:
                        send_status(s, 500, 'Internal Error', e)


if __name__ == '__main__':
    main()


# vim: expandtab tabstop=4 shiftwidth=4
