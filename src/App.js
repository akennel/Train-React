import React, {useState} from 'react';
import $ from 'jquery';
import { useCookies } from 'react-cookie';

function ConfigScreen(showConfig, line, homeStation, workStation, setHomeStation, setWorkStation, setLine, setCookie, setShowConfig) {
  const lines = require("./assets/lines.json");
  const stations = require('./assets/stations.json');
  const ccStations = [90004, 90005, 90006, 90007];
  const [homeStations, setHome] = useState(getStations(line, true));
  const [workStations, setWork] = useState(getStations(line, false));
  

  function getStations(line, includeCC) { 
    let newStations = []; 
    if (includeCC) {  
      newStations = stations.filter(station=>((station.Station_Line.indexOf(line) >= 0) && (ccStations.indexOf(station.Station_ID) < 0)));
    }
    else {
      newStations = stations.filter(station=>((station.Station_Line.indexOf(line) >= 0) && (ccStations.indexOf(station.Station_ID) >= 0)));
    }
    return newStations;
  }

  function changeLine(event) {
    let line = event.target.selectedOptions[0].id;
    let newHomeStations = getStations(line, true);
    let newWorkStations = getStations(line, false);
    setLine(line);
    setHome(newHomeStations);
    setWork(newWorkStations);
  }

  function saveChanges() {
    setCookie('line', line);
    setCookie('home', homeStation);
    setCookie('work', workStation);
    setShowConfig(false);
  }

  if (!showConfig) {
    return<React.Fragment></React.Fragment>
  }
  else {
  return(
    <div className="bg-gray-400 pr-2 pl-2 pt-2 pb-2">
      <div className="flex items-stretch pb-5">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
        Line
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{changeLine(event)}} defaultValue={line} className="">
            {lines.map(l=>(
              <option key={l.Line_ID} id={l.Line_ID} value={l.Line_ID}>{l.Line_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-5">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
        Work Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{setWorkStation(event.target.value)}} defaultValue={workStation}>
            {workStations.map(station=>(
              <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-5">
        <span className="text-blue-900 font-bold text-md w-2/6">
        Home Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{setHomeStation(event.target.value)}} defaultValue={homeStation}>
            {homeStations.map(station=>(
                <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <button onClick={saveChanges}>Save Changes</button>
    </div>
  )
          }
}

function Delay(delay) {
  if (delay === 'On time') {
    return (
      <div className=" border-green-400 border-solid border-2 rounded-full w-6 h-6 text-center align-middle text-green-700 pb-4 bg-green-200">&#x2713;</div>
    );
  }
  else {
    delay = delay.replace(" min", "").replace("s", "");
    return (
      <div className="border-solid border-red-400 border-2 rounded-full w-6 h-6 text-center align-top text-red-700 pb-4 bg-red-200">{delay}</div>
    );
  }
}


function TrainInfo(startStation, endStation) {
  const [data, setData] = useState([]);

  async function getTrainTimes() {
    let API =  "https://www3.septa.org/hackathon/NextToArrive/?req1=" + startStation +"&req2=" + endStation + "&req3=2&callback=?";
    let data = await $.getJSON(API);
    setData(data);
  }

  if (data.length === 0) {
    getTrainTimes();
    return( <div>Loading...</div>);
  }

  if (data.length > 0) {
  return (
    <React.Fragment>
      <ul>
      {data.map(time=>(
        <li key={time.orig_arrival_time}>Departs: {time.orig_departure_time} Arrives:{time.orig_arrival_time} {Delay(time.orig_delay)}</li>
      ))}
      </ul>
    </React.Fragment>
  );
  }
}


function App() {
  const [cookies, setCookie] = useCookies(['line', 'home', 'work']);
  const [homeStation, setHomeStation] = useState(getInitialHome());
  const [workStation, setWorkStation] = useState(getInitialWork());
  const [line, setLine] = useState(getInitialLine());
  const [showConfig, setShowConfig] = useState(false); 


  function getInitialLine() {
    let line = 'NOR';
    if (cookies.line) {
      line = cookies.line;
    }
    return line;
  }

  function getInitialHome() {
    let home = 'East Falls';
    if (cookies.home) {
      home = cookies.home;
    }
    return home;
  }

  function getInitialWork() {
    let work = 'Market East';
    if (cookies.work) {
      work = cookies.work;
    }
    return work;
  }

  return (      
    <div className="container mx-auto pr-5 pl-5 pt-5">
      <div className="">
        <div>{ConfigScreen(showConfig, line, homeStation, workStation, setHomeStation, setWorkStation, setLine, setCookie, setShowConfig)}</div>
        <div>
          <div className="flex flex-col pb-5 pt-5">
            <h1 className="text-blue-900 font-bold text-lg text-center">
            {homeStation} to {workStation}:
            </h1>
            {TrainInfo(homeStation, workStation)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-blue-900 font-bold text-lg text-center">
            {workStation} to {homeStation}:
            </h1>
            {TrainInfo(workStation, homeStation)}
          </div>
        </div>  
        {!showConfig &&
        <button onClick={() => setShowConfig(true)} className="pt-10">Config</button>
        }
    </div>
    </div>
  );
}

export default App;
