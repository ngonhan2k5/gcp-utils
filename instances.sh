#!/bin/bash
if [ $# = 0 ] ; then
    echo "Syntax: (list|start|stop) [matching_name|all]"
    echo "Example: ./instances.sh start instance-1"
else
    cd instances && npm start $@
fi