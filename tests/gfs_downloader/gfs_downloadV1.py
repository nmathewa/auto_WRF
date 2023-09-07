#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Sep  7 15:31:20 2023

@author: nmathewa
"""

import requests
import urllib.request
import datetime
import os

def download_gfs_data(date, hour):
  """Downloads GFS data for the specified date and hour.

  Args:
    date: The date of the GFS data in the format YYYYMMDD.
    hour: The hour of the GFS data in the format HH.

  Returns:
    The path to the downloaded GFS data file.
  """
  """
  url = "https://nomads.ncep.noaa.gov/dods/gfs_1p00/gfs{date}/{hour}z".format(
      date=date, hour=hour)
  """
  header = 'https://nomads.ncep.noaa.gov/pub/data/nccf/com/gfs/prod/'
  data_head = header + 'gfs.{date}/{fore_ld}/atmos/'.format(
      date=date,fore_ld=hour)
  filename = "gfs_{date}_{hour}z.nc"
  filepath = os.path.join("downloads", filename)

  if os.path.exists(filepath):
      pass
    
  else:
      print("Creating downloads directory")
      os.mkdir("downloads3")
  
  print("Downloading GFS data to {}".format(filepath))
  with urllib.request.urlopen(data_head) as response:
    with open(filepath, "wb") as fd:
        data = response.read()
        fd.write(data)

  return filepath


if __name__ == "__main__":
  date = "20230907"
  hour = "00"

  filepath = download_gfs_data(date, hour)

  print("GFS data downloaded to {}".format(filepath))