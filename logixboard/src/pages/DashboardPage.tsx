import { ReactElement, useEffect, useState } from "react"
import { Box, makeStyles, useTheme } from "@material-ui/core"
import { DataGrid, GridColDef } from "@material-ui/data-grid"
import Loader from 'react-loader-spinner'
import { fetchShipments, FetchShipmentsResult, ShipmentsResult } from "../data/fetch-shipments"
import moment from 'moment';

const COLUMNS: GridColDef[] = [
    {
        field: 'estimatedArrival',
        headerName: 'Estimated Arrival',
        width: 200
    },
    {
        field: 'houseBillNumber',
        headerName: 'House Bill',
        width: 150
    },
    {
        field: 'client',
        headerName: 'Shipper',
        width: 200
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 200
    },
    {
        field: 'destination',
        headerName: 'Destination',
        width: 400
    },
    {
        field: 'origin',
        headerName: 'Origin',
        width: 400
    },
    {
        field: 'estimatedDeparture',
        headerName: 'Estimated Departure',
        width: 200
    },
    {
        field: 'mode',
        headerName: 'Mode',
        width: 200
    }
]


const useStyles = makeStyles({
    grid: {
        marginInline: 16,
        height: '100%'
    },
    loader: {
        margin: 'auto',
        width: 'fit-content',
        marginTop: 200
    }
})

type LoadingResult = {
    status: 'LOADING'
}
const INITIAL_RESULT: LoadingResult = {
    status: 'LOADING'
}
const DATE_FORMAT = 'MM/DD/YY';
const today = new Date();
const startDate = moment(today).format(DATE_FORMAT).toString();

const week = 7;
const sevenDaysAhead = new Date(today.getFullYear(), today.getMonth(), today.getDate() + week);
const endDate = moment(sevenDaysAhead).format(DATE_FORMAT).toString();

export const DashboardPage: React.FC = () => {
    const classes = useStyles()
    const theme = useTheme()

    const [fetchShipmentsResult, setFetchShipmentsResult] = useState<FetchShipmentsResult | LoadingResult>(INITIAL_RESULT)
    const [nextWeekShipments, setNextWeekShipments] = useState<ShipmentsResult>([]);
    
    useEffect(() => {
        fetchShipments().then(result => {
            if(result.status === 'SUCCESS'){
                const shipments = [...result.shipments];

                const nextWeekArrivals = shipments.filter(shipment =>
                    shipment.estimatedArrival > startDate && shipment.estimatedArrival <= endDate);
                
                setNextWeekShipments(nextWeekArrivals);
                setFetchShipmentsResult(result)
            }
        })
    }, [])

    let component: ReactElement
    switch (fetchShipmentsResult.status) {
        case 'SUCCESS':
            component = <div style={{minWidth: "100%", height: "80%"}}>
                        <h2 style={{marginLeft: 20}}>Next 7 days arrivals</h2>
                            <DataGrid
                            className={classes.grid}
                            rows={nextWeekShipments}
                            columns={COLUMNS} 
                            autoPageSize pagination
                            disableSelectionOnClick
                            />
                </div>
            break;
        case 'LOADING':
            component = <Box className={classes.loader}>
                <Loader type="Grid" color={theme.palette.primary.main} />
            </Box >
            break
        case 'ERROR':
            component = <p>Error</p>
            break
    }

    return component
}