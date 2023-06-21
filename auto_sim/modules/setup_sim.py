


import pandas as pd
import os
import re


class simsetup():
    
    def __init__(self,domain_fol):
        """
        This class is used to setup the simulation. It reads the namelist files and edits them.
        saves in the same folder as the namelist files.
        """
        dft = pd.read_csv(domain_fol + 'sim_dft.csv')
        os.chdir(domain_fol)
        dft['wps_namelist'] = dft['files'].astype(str) +  'namelist.wps'
        dft['wrf_namelist'] = dft['files'].astype(str) +  'namelist.input'
        dft['date'] = pd.to_datetime(dft['date'])
    
        self.dft = dft
        self.locations = dft['locations'].astype(str)

    def get_wps_time(self,dft):

        date = dft['date']
        hour = dft['hour']
        forecast_days = dft['forecast (days)']
        
        start_date = str(date) + '_' + str(hour) + ':00:00'
        end_date = str(date + pd.Timedelta(days=forecast_days)) + '_' + str(hour) + ':00:00'
        interval_seconds = forecast_days * 24 * 60 * 60

        dft_wps = pd.Series(dtype=object)
        dft_wps['start_date'] = start_date
        dft_wps['end_date'] = end_date
        dft_wps['interval_seconds'] = interval_seconds

        return dft_wps






    def get_wrf_time(self,dft):
    
    
        date = dft['date']
        hour = dft['hour']
        forecast_days = dft['forecast (days)']

        spacing = "\t\t\t     "
        run_days = dft['forecast (days)']
        start_year,end_year = str(date.year) , str((date + pd.Timedelta(days=forecast_days)).year)
        start_month,end_month = str(date.month) , str((date + pd.Timedelta(days=forecast_days)).month)
        start_day,end_day = str(date.day) , str((date + pd.Timedelta(days=forecast_days)).day)
        start_hour,end_hour = str(hour) , str(hour)
        start_minute,end_minute = '00' , '00'
        start_second,end_second = '00' , '00'
        interval_seconds = str(forecast_days * 24 * 60 * 60)
        run_hours = str(forecast_days * 24)
        run_minutes = 0
        run_seconds = 0


        dft_wrf = pd.Series(dtype=object)
        dft_wrf['run_days'] = run_days
        dft_wrf['run_hours'] = run_hours
        dft_wrf['run_minutes'] = run_minutes
        dft_wrf['run_seconds'] = run_seconds
        dft_wrf['start_year'] = start_year
        dft_wrf['start_month'] = start_month
        dft_wrf['start_day'] = start_day
        dft_wrf['start_hour'] = start_hour
        dft_wrf['start_minute'] = start_minute
        dft_wrf['start_second'] = start_second
        dft_wrf['end_year'] = end_year
        dft_wrf['end_month'] = end_month
        dft_wrf['end_day'] = end_day
        dft_wrf['end_hour'] = end_hour
        dft_wrf['end_minute'] = end_minute
        dft_wrf['end_second'] = end_second
        dft_wrf['interval_seconds'] = interval_seconds

        return dft_wrf
    

    def edit_namelist(self):
        """
        Edit namelist files for WPS and WRF
        """
        dft = self.dft.set_index('locations')

        wps_configs = dft.apply(self.get_wps_time,axis=1)
        wrf_configs = dft.apply(self.get_wrf_time,axis=1)

        

        return wrf_configs






    



print(simsetup('/home/nma/GIT/auto_WRF/auto_sim/modules/files/').edit_namelist())



