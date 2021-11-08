//When time is 4:30, sets startTime to 4:45AM and then endTime to 4:00AM, should increment endTimeHr by 1.

import {useState, useEffect} from 'react';
import axios from 'axios';



function UserPage () {

    //Value to disable or enable time fields
    const [disableTime, setDisableTime] = useState(false);
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState(new Date().getHours() > 12 ? new Date().getHours() - 11 : new Date().getHours()+1);    
    const [startTimeMinutes, setStartTimeMinutes] = useState(((Math.ceil((new Date().getMinutes()*1)/15)*15)) > 59 ? ((Math.ceil((new Date().getMinutes()*1)/15)*15)) - 60 : ((Math.ceil((new Date().getMinutes()*1)/15)*15)));
    const [endTime, setEndTime] = useState(new Date().getHours() > 12 ? new Date().getHours() - 11 : new Date().getHours()+ (new Date().getMinutes() >= 45 ? 1 : 2));
    const [endTimeMinutes, setEndTimeMinutes] = useState((Math.ceil((new Date().getMinutes()*1)/15)*15 + 15) > 59 ? (Math.ceil((new Date().getMinutes()*1)/15)*15 + 15) - 60 : (Math.ceil((new Date().getMinutes()*1)/15)*15 + 15));
    const [user, setUser] = useState(false)
    const [tasks, setTasks] = useState(false)
    const [AMorPM, setAMorPM] = useState(new Date().getHours() > 12 ? "PM" : "AM");
    const [endAMorPM, setENDAMorPM] = useState(new Date().getHours() > 12 ? "PM" : "AM");        
    const days = new Date();    
    const [daysToFilter, setDaysToFilter] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [urgency, setUrgency] = useState(6);

    //DEV STATE
    const [startTimeDev, setStartTimeDev] = useState("");;
    const [endTimeDev, setEndTimeDev] = useState("");
    const [descriptionDev, setDescriptionDev] = useState("");

    //function to fetch tasks and set the state
    const fetchTasks = () => {
        axios.get("/api/tasks", { headers : {
            "Authorization" : `Bearer ${window.localStorage.getItem('token')}`
        }}).then(tasks => {
            setTasks(tasks)
        })
    }

    useEffect(() => {
        axios.get("/api/users/me", { headers : {
                "Authorization" : `Bearer ${window.localStorage.getItem('token')}`
            }}).then(currentUser => {
                setUser(currentUser)
            })                        
        fetchTasks();                    
    }, [])

    const formattedDate = (hour, minutes, day=new Date().getDay()) => {
        
        const today = new Date();

        const fullYear = today.getFullYear();
        const month = today.getMonth();
        

        return new Date(fullYear, month, day, hour, minutes);
        
    }
    

    const createTask = async (dev) => {

        
        
        let startTimeHour = startTime;          
        let endTimeHour = endTime;
        let startTimeMin = startTimeMinutes;
        let endTimeMin = endTimeMinutes;
        let amOrPm = AMorPM;
        let endAmOrPm = endAMorPM;
        let myDescription = description;
        //let myDays = days;
        
        

        if(dev === "dev"){
            const [startTimeHr, startTimeMins] = startTimeDev.slice(0, -2).split(":");
            const [endTimeHr, endTimeMins] = endTimeDev.slice(0, -2).split(":");
            
            startTimeHour = startTimeHr;
            endTimeHour = endTimeHr;
            startTimeMin = startTimeMins;
            endTimeMin = endTimeMins;            
            amOrPm = startTimeDev.slice(startTimeDev.length - 2, startTimeDev.length);
            endAmOrPm = endTimeDev.slice(endTimeDev.length - 2, endTimeDev.length);
            myDescription = descriptionDev;

        }
        
        
        // console.log(startTimeMinutes, endTimeMinutes);

        if(disableTime){
            await axios.post("/api/tasks", { description : myDescription }, { headers : {
                "Authorization" : `Bearer ${window.localStorage.getItem('token')}`
            }});   
        } else {
        //console.log(fullYear, month, day, startTimeHour = AMorPM === "PM" ? ((startTime*1) + 12).toString() : startTimeHour, startTimeMinutes);        
        console.log(amOrPm === "PM" ? ((startTimeHour*1) + 12).toString() : startTimeHour);
        console.log(endTimeHour = endAmOrPm === "PM" ? ((endTimeHour*1) + 12).toString() : endTimeHour)

        const startTimeDate = formattedDate(startTimeHour = amOrPm === "PM" ? ((startTimeHour*1) + 12).toString() : startTimeHour, startTimeMin, selectedDate);
        //console.log(startTimeDate);
        const endTimeDate = formattedDate(endTimeHour = endAmOrPm === "PM" ? ((endTimeHour*1) + 12).toString() : endTimeHour, endTimeMin, selectedDate)

        await axios.post("/api/tasks", { description : myDescription, startTime : startTimeDate, endTime : endTimeDate, amOrPm, endAmOrPm }, { headers : {
            "Authorization" : `Bearer ${window.localStorage.getItem('token')}`
        }});

        }

        
        fetchTasks();
        // dev === "dev" ? setDescriptionDev("") : setDescription("")
        if(dev === "dev"){
            setDescriptionDev("");
            setStartTimeDev("");
            setEndTimeDev("");
        } else {
            setDescription("");
        }
                
        
                        
    }

    const deleteTask = async (taskId) => {
        await axios.delete(`/api/tasks/${taskId}`, { headers : {
            "Authorization" : `Bearer ${window.localStorage.getItem('token')}`
        }});
        
        fetchTasks();

    }

    //converting milliseconds to hours
    const convertToMilliseconds = (hours) => {        
        return hours*3600000;
    }

    //convert database task into proper format
    const convertDate = (date, amOrPm) => {        
        const newDate = new Date(date);
        let hours = newDate.getHours();
        let minutes = newDate.getMinutes();

        console.log(hours);

        if(minutes === 0){
            minutes = `00`;
        }
        // console.log("convertDate", hours, minutes);
        if(hours > 12){
            hours -= 12;
        }
            return `${hours === 0 ? 12 : hours}:${minutes}${amOrPm}`
        
        
        
    }

    const buttonValidator = () => {
        let fullStartTime = ((startTime*1) * 60) 
        let fullStartMinutes =  (startTimeMinutes*1);
        let fullEndTime = ((endTime*1) * 60) 
        let fullEndMinutes = (endTimeMinutes*1);
        
        //if its PM, add total minutes, 12 hours * 60 minutes = 720 minutes
        if(AMorPM === "PM"){
            fullStartTime += 720;
        }
        if(endAMorPM === "PM"){
            fullEndTime += 720;
        }

        
        

        const today = new Date();
        

        const fullYear = today.getFullYear();
        const month = today.getMonth();
        const day = selectedDate;

        

        //Make new date with new hour and day values
        const currentDate = new Date();
        //Date for startTime task
        
        const startTimeTaskDate = new Date(fullYear, month, day, (fullStartTime/60), fullStartMinutes); 
        //Date for endTime task
        
        const endTimeTaskDate = new Date(fullYear, month, day, (fullEndTime/60), fullEndMinutes);
        
        //console.log(Date.parse(currentDate));
        //console.log(Date.parse(dateToCompare), "created date");
        //console.log(Date.parse(currentDate) < Date.parse(dateToCompare));


        //console.log(fullStartTime)
        //console.log(fullEndTime, "full end time")
        if((1*Date.parse(startTimeTaskDate)) > (1*Date.parse(currentDate)) && (Date.parse(startTimeTaskDate) < Date.parse(endTimeTaskDate))){                        
            return false;
        } 
        return true;
    }

    const pickStartTime = (e) => {
        setStartTime(e.target.value);
    }
    const pickEndTime = (e) => {
        setEndTime(e.target.value);
    }
    const pickStartTimeMinutes = (e) => {
        setStartTimeMinutes(e.target.value);
    }
    const pickEndTimeMinutes = (e) => {
        setEndTimeMinutes(e.target.value);
    }
    const pickAMorPM = (e) => {
        setAMorPM(e.target.value);
    }
    const pickAMorPMEND = (e) => {
        setENDAMorPM(e.target.value);
    }

    const enterTask = (e) => {        
        setDescription(e.target.value);        
    }

    //DEV FUNCTIONS
    const enterTaskDev = (e) => {
        setDescriptionDev(e.target.value);
    }
    const handleEndTimeDev = (e) => {        
        setEndTimeDev(e.target.value)        
    }
    const handleStartTimeDev = (e) => {
        setStartTimeDev(e.target.value)
    }


    const getMonthAndDay = () => {
        const today = new Date();
        //set day to NEXT day incase we are on the last day of the month.                
        return `${today.toLocaleString('default', { month: 'short' })} ${today.getDate()}`
    }

    const getMonthString = (date) => {
    
        const newDate = new Date(date)

        // const fullYear = newDate.getFullYear();
        // const monthValue = newDate.getMonth();

        
        return `${newDate.toLocaleString('en-us', { month: 'long' })} ${newDate.getDate()}`
    }


    const getMonthAndDay2 = () => {
        const currentDay = new Date();
        //set day to NEXT day incase we are on the last day of the month.
        const month = currentDay.toLocaleString('default', { month: 'short' })

        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + days.getDate());
                

        return `${month} ${currentDay.getDate()}`
    }

    const getCorrectDay = () => {
        
        const today = new Date();
        today.setDate((daysToFilter*1)+days.getDate());

        //setDaysToFilter(today.setDate(today.getDate() + (daysToFilter*1)));
        return today;
    }

    //function used to get a date with 24hour value
    const dateToCompare =  () => {

        const myDate = new Date();

        const year = myDate.getFullYear();
        const month = myDate.getMonth();
        const day = myDate.getDate() + (1*daysToFilter);
        
        return new Date(year, month, day, 24, 0);
    }
    
    //This will sort our tasks Array for us using their starting time in milliseconds        

    let sortedTasks = (tasks.data && Array.isArray(tasks.data) ) ? tasks.data.sort((a, b) => {
        const millisecondsA = new Date(a.startTime).getTime();
        const millisecondsB = new Date(b.startTime).getTime();        

        return millisecondsA - millisecondsB
    }).filter(task =>  (Date.parse(new Date(task.startTime)) < Date.parse(dateToCompare()) || !task.startTime)) : [];
    
    //console.log(daysToFilter);
    //console.log(sortedTasks);

    //find the amount of days in current month to map over.
    const amountOfDays = () => {
        const today = new Date();

        const anotherDay = new Date();

        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        return new Date(year, month, 0).getDate() - anotherDay.getDate();
    }


    //console.log(user);
    //console.log(tasks);
    // console.log(startTime);
    // console.log(startTimeMinutes);
    // console.log(endTime);
    // console.log(endTimeMinutes);
    // console.log(AMorPM);
    //console.log(startTimeDev);
    // console.log(urgency);
    
    

    return (
        <div>
            Hey <strong>{user.data ? user.data.name : "guest"}!</strong> 
            <p> Date today : <strong> {getMonthAndDay()}</strong> </p>
            <br />
            <p> Tasks for the next <input value={Number(daysToFilter).toString()} onChange={(e) => setDaysToFilter(e.target.value)} type="number" style={{ fontSize:"20px", textAlign:"center", width: "50px", height:"25px"}} /> days </p>                       
            <p> Urgency(hours) <input value={Number(urgency).toString()} onChange={(e) => setUrgency(e.target.value*1)} type="number" style={{ fontSize:"20px", textAlign:"center", width: "50px", height:"25px"}} /> </p>
            <h2> Your Tasks from {getMonthAndDay2()} {daysToFilter > 0 ? `to ${getCorrectDay().toLocaleString('default', { month: 'short' })} ${getCorrectDay().getDate()}` : "" }</h2>                                    
            {sortedTasks ? sortedTasks.length === 0 ? "No Tasks" : sortedTasks.map(task => {
                return <div key={task._id}>
                {task.startTime && task.endTime ?
                    <div> {getMonthString(task.startTime)} - <strong> {convertDate(task.startTime, task.amOrPm)} - {convertDate(task.endTime, task.endAmOrPm)} </strong> </div>
                    :
                    null }
                <li style={{ color: Date.parse(task.startTime) - Date.now() < convertToMilliseconds(urgency) ? "red" : "", marginBottom:"15px" }}>{task.description}
                <button style={{marginLeft:"10px"}} onClick={() => deleteTask(task._id)}> x </button>
                <br />                
                </li> 
                </div>                               
            }) : null}
            <h2> Create your task below ! </h2>
            <h6> Note : If left blank, month or day is the value of month and day today </h6>
            {/* <p> Enter date for new task <input type="number" style={{ marginRight:"20px", width: "50px", height:"30px"}} /> </p> */}
            
            <p> Click date for new task </p>
            <p style={{ fontWeight:"bold", color:"limegreen" }}> {selectedDate} </p>
            <div style={{ width: "35%" }}>              
            <button onClick={()=>setSelectedDate(new Date().getDate())} style={{width:"30px", height:"30px"}}> {new Date().getDate()} </button>
                {Array.from(Array(amountOfDays()).keys()).map(day => {
                    return (
                        <button key={day} onClick={()=>setSelectedDate(day+1+(new Date().getDate()))} style={{width:"30px", height:"30px"}}> {day+1+(new Date().getDate())} </button>
                    )
                })}
            </div>
            <h4> Description </h4>
            <textarea style={{ height:`${20+description.length}px`, width:"150px"}} value={description} onChange={enterTask} />

            {/* <h4> Start time </h4>
            <input type="text" name="startTime" value={startTime} onChange={enterTask} /> */}            
            <h3> Time </h3>
            <button onClick={() => setDisableTime(!disableTime)} style={{ backgroundColor: disableTime ? "limegreen" : "crimson", marginLeft:"10px", fontWeight:"bold" }}> { disableTime ? "select time" : "omit time" } </button>
            {disableTime ? "" : <div>             
            <label>                
          Pick your start time 
          <select disabled={disableTime} style={{ marginLeft:"5px", marginTop:"10px" }} value={startTime} onChange={pickStartTime}>            
            {Array.from(Array(12).keys()).map(hour => {
                return (
                    <option key={hour} value={hour+1}> {hour+1} </option>
                )
            })}
          </select>
          <select disabled={disableTime} value={startTimeMinutes} onChange={pickStartTimeMinutes}>
                <option value={0}> 00 </option>            
            {Array.from(Array(3).keys()).map(minutes => {
                return (
                    <option key={minutes} value={(minutes+1)*15}> {(minutes+1) * 15} </option>
                )
            })}                    
          </select>
        </label>
        <select disabled={disableTime} value={AMorPM} onChange={pickAMorPM}>
            <option  value="AM"> AM </option>
            <option  value="PM"> PM </option>
        </select>                
        <label>
                <br />
          Pick your end time 
          <select disabled={disableTime} style={{ marginLeft:"9px", marginTop:"10px" }} value={endTime} onChange={pickEndTime}>            
            {Array.from(Array(12).keys()).map(hour => {
                return (
                    <option key={hour} value={hour+1}> {hour+1} </option>
                )
            })}
          </select>
          <select disabled={disableTime} value={endTimeMinutes} onChange={pickEndTimeMinutes}>
          <option value={0}> 00 </option>            
            {Array.from(Array(3).keys()).map(minutes => {
                return (
                    <option key={minutes} value={(minutes+1)*15}> {(minutes+1) * 15} </option>
                )
            })}            
          </select>
        </label>
        <select disabled={disableTime} value={endAMorPM} onChange={pickAMorPMEND}>
            <option  value="AM"> AM </option>
            <option  value="PM"> PM </option>
        </select>        
        </div> }
        <br />
        <br />
        { buttonValidator() ? <p style={{ color: "red" }}> PLEASE SELECT AN APPROPRIATE TIMING / DATE! </p> : null}
            <button disabled={buttonValidator()} style={{ marginTop:"10px"}} onClick={createTask}> Create task </button>            
            
        <h2> Create task as Dev </h2>
        <h4> Description </h4>        
        <textarea style={{ height:`${20+descriptionDev.length}px`, width:"150px"}} value={descriptionDev} onChange={enterTaskDev} />
        <br />
        <p>Enter your start time and end time in proper format. (example: 1:15AM to 1:30AM)</p>
        <input value={startTimeDev} onChange={handleStartTimeDev} type="text" style={{ marginRight:"20px", width: "50px", height:"30px"}} />
        to
        <input value={endTimeDev} onChange={handleEndTimeDev} type="text" style={{ marginLeft:"20px", width: "50px", height:"30px"}} />                    
        <br/>
        <button style={{ marginTop:"10px"}} onClick={() => createTask("dev")}> Create task dev </button>


        </div>
    )
}

export default UserPage