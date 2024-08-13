#!/bin/python3
import sys
sys.path.append('/home/joe/skel')
sys.path.append('/usr/lib/python39.zip')
sys.path.append('/usr/lib/python3.9')
sys.path.append('/usr/lib/python3.9/lib-dynload')
sys.path.append('/home/joe/.local/lib/python3.9/site-packages')
sys.path.append('/usr/local/lib/python3.9/dist-packages')
sys.path.append('/usr/lib/python3/dist-packages')
sys.path.append('/usr/lib/python3.9/dist-packages')

print(sys.path)
import socket
import struct
import argparse
import io
import serial

print("Started");

SerialPortObj = serial.Serial('/dev/serial/by-path/platform-20980000.usb-usb-0:1:1.0', 19200)

print('\nStatus -> ',SerialPortObj)

# SerialPortObj.close()


def run(groups, port, iface=None, bind_group=None):


    # generally speaking you want to bind to one of the groups you joined in
    # this script,
    # but it is also possible to bind to group which is added by some other
    # programs (like another python program instance of this)

    # assert bind_group in groups + [None], \
    #     'bind group not in groups to join'
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

    # allow reuse of socket (to allow another instance of python running this
    # script binding to the same ip/port)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    sock.bind(('' if bind_group is None else bind_group, port))
    for group in groups:
        mreq = struct.pack(
            '4sl' if iface is None else '4s4s',
            socket.inet_aton(group),
            socket.INADDR_ANY if iface is None else socket.inet_aton(iface))

        sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)


    while True:
        cc = str(SerialPortObj.readline().decode())
        print(cc[2:][:-5])

        mystr = sock.recv(30).decode("utf-8").strip() #10240
        print(mystr)
        SerialPortObj.write((mystr + "\n").encode())


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=2390)
    parser.add_argument('--join-mcast-groups', default=[], nargs='*',
                        help='multicast groups (ip addrs) to listen to join')
    parser.add_argument(
        '--iface', default=None,
        help='local interface to use for listening to multicast data; '
        'if unspecified, any interface would be chosen')
    parser.add_argument(
        '--bind-group', default=None,
        help='multicast groups (ip addrs) to bind to for the udp socket; '
        'should be one of the multicast groups joined globally '
        '(not necessarily joined in this python program) '
        'in the interface specified by --iface. '
        'If unspecified, bind to 0.0.0.0 '
        '(all addresses (all multicast addresses) of that interface)')
    args = parser.parse_args()
    run(args.join_mcast_groups, args.port, args.iface, args.bind_group)