import React, {useState} from 'react';
import { useCookies } from 'react-cookie';
import {PullToRefresh} from "react-js-pull-to-refresh";

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
    const now = new Date();
    setCookie('line', line, {path: '/', expires: new Date(now.setFullYear(now.getFullYear() + 1))});
    setCookie('home', homeStation, {path: '/', expires: new Date(now.setFullYear(now.getFullYear() + 1))});
    setCookie('work', workStation, {path: '/', expires: new Date(now.setFullYear(now.getFullYear() + 1))});
    setShowConfig(false);
  }

  function discardChanges() {
    window.location.reload(false);
  }

  if (!showConfig) {
    return<React.Fragment></React.Fragment>
  }
  else {
  return(
    <div className="bg-gray-400 pr-2 pl-2 pt-2 pb-2 shadow-md">
      <div className="flex items-stretch pb-8">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
        Line
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{changeLine(event)}} defaultValue={line}>
            {lines.map(l=>(
              <option key={l.Line_ID} id={l.Line_ID} value={l.Line_ID}>{l.Line_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-8 ">
        <span className="flex text-blue-900 font-bold text-md w-2/6">
        Work Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{setWorkStation(event.target.value)}} defaultValue={workStation} >
            {workStations.map(station=>(
              <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex items-stretch pb-8">
        <span className="text-blue-900 font-bold text-md w-2/6">
        Home Station
        </span>
        <span className="flex w-4/6 justify-end">
          <select onChange={(event)=>{setHomeStation(event.target.value)}} defaultValue={homeStation} >
            {homeStations.map(station=>(
                <option key={station.Station_ID} value={station.Station_Name}>{station.Station_Name}</option>
            ))}
          </select>
        </span>
      </div>
      <div className="flex flex-row justify-between">
        <button onClick={saveChanges} className="text-gray-900 w-auto bg-gray-300 border-gray-500 border-solid border-2 shadow-md mt-4 p-1">Save Changes</button>
        <button onClick={discardChanges} className="text-gray-900 w-auto bg-gray-300 border-gray-500 border-solid border-2 shadow-md mt-4 p-1">Undo Changes</button>
      </div>
    </div>
  )
          }
}

function Delay(delay) {
  if (delay === 'On time') {
    return (
      <div className="flex justify-center items-center border-green-400 border-solid border-2 rounded-full w-12 h-12 text-green-700 bg-green-200">
        &#x2713;
      </div>
    );
  }
  else if (delay === '999 mins') {
    return (
      <div className="flex justify-center items-center border-solid border-red-400 border-2 rounded-full w-12 h-12 text-red-700 bg-red-200">
         &#x0078;
      </div>
    );
  }
  else {
    delay = delay.replace(" min", "").replace("s", "");
    return (
      <div className="flex justify-center items-center border-solid border-red-400 border-2 rounded-full w-12 h-12 text-red-700 bg-red-200">
        +{delay}
      </div>
    );
  }
}


function TrainInfo(startStation, endStation) {
  const [data, setData] = useState([]);
  const [called, setCalled] = useState(false);

  async function getTrainTimes() {
    const response = await fetch(`/.netlify/functions/get-train?start=${encodeURIComponent(startStation)}&end=${encodeURIComponent(endStation)}`);
    const result = JSON.parse(await response.text());
    setData(result.data);
  }

  if (data.length === 0 && called !== true) {
    getTrainTimes();
    setCalled(true);
    return( <div>Loading...</div>);
  }

  if (data.length > 0) {
  return (
    <React.Fragment>
      {data.map(time=>(
        <div className="flex flex-row pb-3 pt-3 pr-3 pl-3 mb-5 bg-gray-100 shadow-md">
          <span className="flex flex-col w-4/5 ">
            <div className="w-full text-gray-800 text-xl pb-1">Departs: {time.orig_departure_time}</div>
            <div className="w-full text-gray-800 text-md pl-3">Arrives: {time.orig_arrival_time}</div>
          </span>
          <span className="flex w-1/5 justify-end text-lg items-center">
            {Delay(time.orig_delay)}
          </span>
        </div>
      ))}
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
    let work = 'Jefferson Station';
    if (cookies.work) {
      work = cookies.work;
    }
    return work;
  }

  function onRefresh() {
    window.location.reload(false);
  }

  return (      
    <div className="container mx-auto pr-5 pl-5 pt-5">
      <div className="">
        <div>{ConfigScreen(showConfig, line, homeStation, workStation, setHomeStation, setWorkStation, setLine, setCookie, setShowConfig)}</div>
        <div>
          <div className={"lg:invisible"}>
            <PullToRefresh
                pullDownThreshold={200}
                onRefresh={onRefresh}
                triggerHeight={50}
                backgroundColor='white'
                startInvisible={true}            
            >
                <div className={"text-gray-400 font-thin h-5 text-center"}>
                  <div>Pull To Refresh</div>
                  </div>
            </PullToRefresh>
          </div>
          <div className="flex flex-col pb-5 pt-5">
            <h1 className="text-blue-900 font-bold text-2xl text-center">
                {homeStation} to {workStation}
            </h1>
            {TrainInfo(homeStation, workStation)}
          </div>
          <div className="flex flex-col">
            <h1 className="text-blue-900 font-bold text-2xl text-center">
            {workStation} to {homeStation}
            </h1>
            {TrainInfo(workStation, homeStation)}
          </div>
        </div>  
        {!showConfig &&
        <button onClick={() => setShowConfig(true)} className=" text-gray-800 bg-gray-300 border-gray-400 border-solid border-2 shadow-md mt-3 h-auto p-1">Change Stations</button>
        }
    </div>
    </div>
  );
}

export default App;
