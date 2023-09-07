import typer
import os
os.chdir('/home/nmathewa/main/GIT/auto_WRF/auto_sim/modules/')
from data_downloader.gfs_downloader import GFSDownloader
from setup_sim import simsetup
from typing_extensions import Annotated

app = typer.Typer(rich_markup_mode="markdown")



@app.command(no_args_is_help=True)
def get_loc():
    """
    Show exisitng locations 
    """
    
    print(simsetup('/home/nma/GIT/auto_WRF/auto_sim/modules/files/').get_locations())



@app.command(name="set_loc")
def set_loc(
    location: Annotated[str, typer.Argument(help="The location of the data")],
    lat: Annotated[float, typer.Argument(help="The latitude of the domain")],
    lon: Annotated[float, typer.Argument(help="The longitude of the domain")],
):
    """
    Set the location of the GFS and ERA5 data.
    """
    print(f"Setting location to {location}...")
    print(f"Setting lat to {lat}...")
    print(f"Setting lon to {lon}...")
    simsetup('/home/nma/GIT/auto_WRF/auto_sim/modules/files/').set_locations(location, lat, lon)


@app.command()
def download_data(data_type: Annotated[str, typer.Argument(help="Dataset to download. Choose between gfs and era5")]):
    """
    Download the GFS or ERA5 data from the NOMAD server.

    * **Run** the `get-loc` command to get the location of the data.
    * Only GFS and ERA5 data are supported.
    * Output will be saved in the same folder as the namelist files.

    ---

    Learn more at the [my GitHub repo](https://github.com/nmathewa/auto_WRF/tree/main/auto_sim)
    """
    if data_type == "gfs":
        print("Downloading GFS data ...")
        loc = os.getcwd()+'/files/'
        GFSDownloader(loc).download_gfs()
    elif data_type == "era5":
        print("Downloading ERA5 data...")
    else:
        print("Unknown data type. Choose between gfs and era5")

    




if __name__ == "__main__":
    app()