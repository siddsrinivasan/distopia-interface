#!/usr/bin/env python

import rospy
import std_msgs/msg/String
import json

class MockPublishers:
	def __init__(self):
		self.evaluated_designs_pub = rospy.Publisher("/evaluated_designs",String)
		with open("data.json") as f:
			designs = json.load(f)
			self.evaluated_designs_pub.publish(String(designs))

if __name__=="__main__":
	m = MockPublishers()
	rospy.spin()
