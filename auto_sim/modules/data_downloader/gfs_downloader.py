import pandas as pd
import os
import numpy as np
import urllib.request as req
import subprocess
import argparse 




class GFSDownloader:
    """

    This class is used to download GFS data from nomad server. It will download the data for the specified domain and time.
    

    """

    # add command line arguments
   


    def __init__(self,domain_fol):

        """
        Set all required information for downloading GFS data
        """
        self.domain_fol = domain_fol
        dft = pd.read_csv(domain_fol + 'sim_dft.csv')
        os.chdir(domain_fol)
        dft['wps_namelist'] = dft['files'].astype(str) +  'namelist.wps'
        dft['wrf_namelist'] = dft['files'].astype(str) +  'namelist.input'
        dft['date'] = pd.to_datetime(dft['date'])
        
        
        self.locations = dft['locations'].astype(str)
        self.dft = dft


    def get_nomad_url(self,dft):
        
        """
        This function will return the url for downloading GFS data from nomad server
        """
        

        date = dft['date'].strftime('%Y%m%d')

        forecast_days = dft['forecast (days)']

        total_forecast = forecast_days * 24

        out_main = dft['files'].split('/')[1]

        times = np.arange(0,total_forecast+1,1)
        times = [str(x).zfill(3) for x in times]

        """
        This part should be from the user input dataframe
        """

        leftlon = '60'
        rightlon = '100'
        toplat = '40'
        bottomlat = '0'
        date_str = date#'20230622'
        


        all_urls = []
        filename = []
        url1 = "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25.pl?dir=%2F"
        url2 = "gfs."+date_str+"%2F00%2Fatmos&file="
        url4 = "all_var=on&all_lev=on&subregion=&toplat="+toplat+"&leftlon="+leftlon+"&rightlon="+rightlon+"&bottomlat="+bottomlat+"&"
        for jj in times:
            forec_lead = 'f'+str(jj)#'f000'
            url3 = "gfs.t00z.pgrb2.0p25."+forec_lead+"&"

            url = url1 + url2 + url3 + url4
            all_urls.append(url)

        
            filename += ["gfs.t00z.pgrb2.0p25."+forec_lead+".grb2"]

        
        gfs = pd.DataFrame()
        gfs['url'] = all_urls
        gfs['filename'] = filename
        gfs['save_path'] = out_main +os.sep+ 'gfs_'+ date_str +'/'

        if not os.path.exists(gfs['save_path'].iloc[0]):
            os.makedirs(gfs['save_path'].iloc[0])
        

        return gfs



    def download_data(self,data_dft):
        url = data_dft['url']
        filename = data_dft['filename']
        save_path = data_dft['save_path']

        #req.urlretrieve(url,filename)
        #os.system('wget ' + url + ' -O ' + filename)

        full_path = save_path + filename

        
        
        
        os.chdir(self.domain_fol)
        subprocess.call(['wget',url,'-O',full_path])
        

    def download_gfs(self):

        # Download GFS data

        dft = self.dft

        data_dft = dft.apply(self.get_nomad_url,axis=1)

        

        
        

        data_dft_sub =data_dft[0]

        
        
        
        data_dft_sub.apply(self.download_data,axis=1)

        #self.download_data(data_dft_sub)

        


#GFSDownloader('/home/nma/GIT/auto_WRF/auto_sim/modules/files/').download_gfs()
