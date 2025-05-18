import STATION_DATA from "../../station-data.ts"

const getStationName = (stationId: number) => {
    const station = STATION_DATA.find(station => station.id === stationId)
    return station?.station_name
}

export default getStationName