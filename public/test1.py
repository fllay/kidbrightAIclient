from geometry_msgs.msg import Twist
import rospy
rospy.init_node('get_center', anonymous=True)
velocity_publisher = rospy.Publisher('/cmd_vel', Twist, queue_size=1)
vel_msg = Twist()
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
  pass
