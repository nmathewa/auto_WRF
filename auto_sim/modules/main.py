import typer
from data_downloader.gfs_downloader import GFSDownloader
from setup_sim import simsetup
from typing_extensions import Annotated

app = typer.Typer(rich_markup_mode="markdown")



@app.command()
def get_loc():
    
    print(simsetup('/home/nma/GIT/auto_WRF/auto_sim/modules/files/').get_locations())





@app.command()
def download_data(data_type : Annotated[str, typer.Argument(help="Dataset to download. Choose between gfs and era5")]):
    """
    This command will download the data from nomad server. It will download the data based on the user input dataframe.:
    
    * **run** the get-loc command to get the location of the data.

    * Only GFS and ERA5 data are supported

    * output will be saved in the same folder as the namelist files

    ---

    Learn more at the [my github repo](https://github.com/nmathewa/auto_WRF/tree/main/auto_sim)
    """
    if data_type == "gfs":
        print(f"Downloading {data_type}...")
    elif data_type == "era5":
        print(f"Downloading {data_type}...")
    else:
        print("Unknown data type. Choose between gfs and era5")
    

   





if __name__ == "__main__":
    app()