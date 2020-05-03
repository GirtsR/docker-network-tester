FROM selenium/standalone-chrome-debug:latest
USER root
RUN apt-get update && apt-get install -y iptables iproute2 python3-pip iputils-ping
RUN pip3 install tcconfig
