aa = None
i = None
label = None


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
	command='rosrun kidbright_tpu tpu_detect.py /home/pi/nodejs/kbclient/client/public/totoro'
	process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
	time.sleep(10)
while not rospy.is_shutdown():
  import roslib
  import rospy
  from kidbright_tpu.msg import tpu_object
  from kidbright_tpu.msg import tpu_objects
  aa = rospy.wait_for_message('/tpu_objects', tpu_objects, timeout=4).tpu_objects
  for i in aa:
    label = i.label
    if label == 'totoro':
      if (i.cx) > 330:
        vel_msg.linear.y = 0
        vel_msg.linear.z = 0
        vel_msg.angular.x = 0
        vel_msg.angular.y = 0
        vel_msg.linear.x = 0.1
        vel_msg.angular.z = 0.4
        velocity_publisher.publish(vel_msg)
      elif (i.cx) <= 310:
        vel_msg.linear.y = 0
        vel_msg.linear.z = 0
        vel_msg.angular.x = 0
        vel_msg.angular.y = 0
        vel_msg.linear.x = 0.1
        vel_msg.angular.z = -0.4
        velocity_publisher.publish(vel_msg)
      else:
        vel_msg.linear.y = 0
        vel_msg.linear.z = 0
        vel_msg.angular.x = 0
        vel_msg.angular.y = 0
        vel_msg.linear.x = 0
        vel_msg.angular.z = 0
        velocity_publisher.publish(vel_msg)
