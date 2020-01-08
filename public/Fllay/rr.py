#!/usr/bin/env python


import rospy
rospy.init_node('get_center', anonymous=True)

import rosnode
import subprocess
import time
import os
ros_nodes = rosnode.get_node_names()
if not '/image_feature' in ros_nodes:
    command='rosrun kidbright_tpu tpu_detect.py'
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    time.sleep(10)

while not rospy.is_shutdown():
  import roslib
  import rospy
  from kidbright_tpu.msg import tpu_object
  from kidbright_tpu.msg import tpu_objects
  aa = rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects
  
  print(type(aa))
  for i in aa:
    print(aa)
    pass
