//IIFE - load data from localStorage, add data to the table, add edit and delete buttons, 
//set date/time entry defaults, and disable autocomplete for input fields.
(function () {
    loadData();
    addDetailsFeature();
    addEditFeature();
    addDeleteFeature();
    setDefaults();

    //turn off autocomplete.
    $("input, select, textarea").attr("autocomplete", "off");

    $("#flightModal").modal({ backdrop: 'static', keyboard: false, show: false });

    // TODO- on change, if less than 1, pad it with leading zero
    $("#flightStartedMinute").on("change", function () {
        console.log(this.value);
    });

})();

function getEle(elementID) {
    return document.getElementById(elementID);
}

function getVal(elementID) {
    return getEle(elementID).value;
}

//add a flight log to localStorage. Validate before saving.
function addFlightLog() {
    const flightID = makeRandomGuid();
    const flightTimeStamp = new Date().getTime(); //used to sort by latest flight made. cannot edit.Unix timestamp in milliseconds eg: 1581527018459
    const flightDate = getVal("flightDate");
    const flightStartedHour = getVal("flightStartedHour");
    const flightStartedMinute = getVal("flightStartedMinute");
    const flightEndedHour = getVal("flightEndedHour");
    const flightEndedMinute = getVal("flightEndedMinute");
    const flightPlaneName = getVal("flightPlaneName");
    const flightType = getVal("flightType");
    const flightNotes = getVal("flightNotes");
    const flightKills = getVal("flightKills");
    const flightMission = getVal("flightMission");

    //format time - if
    if (flightStartedMinute.length != 2) {
        flightStartedMinute = flightStartedMinute.padStart(2, "0");
    }

    if (flightEndedMinute.length == 1) {
        flightEndedMinute = flightEndedMinute.padStart(2, "0");
    }

    //create a JSON object to represent the data
    const flightLog = {
        "flightID": flightID,
        "flightTimeStamp": flightTimeStamp,
        "flightDate": flightDate,
        "flightStartedHour": flightStartedHour,
        "flightStartedMinute": flightStartedMinute,
        "flightEndedHour": flightEndedHour,
        "flightEndedMinute": flightEndedMinute,
        "flightPlaneName": flightPlaneName,
        "flightType": flightType,
        "flightKills": flightKills,
        "flightNotes": flightNotes,
        "flightMission": flightMission
    };

    if (isFlightLogValid(flightLog)) {
        //put the object into storage
        localStorage.setItem(flightID, JSON.stringify(flightLog));
        $("#flightModal").modal("hide");

        $("#flightAddedModal").modal();
        setTimeout(function () {
            location.reload();
        }, 1000);
    }
}


//validate a flight log for correct times/dates
function isFlightLogValid(flightLog) {
    let alertStr = "";

    if (new Date(flightLog.flightDate).toString() === "Invalid Date") {
        alertStr += "\nInvalid date format. Enter date as such: Month/Day/Year or Year-Day-Month.";
    }

    if (isNaN(Number(flightLog.flightStartedHour))
        || isNaN(Number(flightLog.flightStartedMinute))
        || isNaN(Number(flightLog.flightEndedHour))
        || isNaN(Number(flightLog.flightEndedMinute))) {
        alertStr += "\nInvalid time format.";
    }

    if (Number(flightLog.flightStartedHour) < 0 || Number(flightLog.flightStartedHour) > 23) {
        alertStr += "\nInvalid hour entry for flightStartedHour. Valid values are 0 to 23.";
    }

    if (Number(flightLog.flightStartedMinute) < 0 || Number(flightLog.flightStartedMinute) > 59) {
        alertStr += "\nInvalid minute entry for flightStartedMinute. Valid values are 0 to 59.";
    }

    if (Number(flightLog.flightEndedHour) < 0 || Number(flightLog.flightEndedHour) > 23) {
        alertStr += "\nInvalid hour entry for flightEndedHour. Valid values are 0 to 23.";
    }

    if (Number(flightLog.flightEndedMinute) < 0 || Number(flightLog.flightEndedMinute) > 59) {
        alertStr += "\nInvalid minute entry for flightEndedMinute. Valid values are 0 to 59.";
    }

    if (alertStr.length > 0) {
        window.alert("Errors entering flight log:\n" + alertStr);
        return false;
    }

    return true;
}


//get flights from local storage as JSON objects. potentially reuse elsewhere (but not currently in download feature)
function getFlights() {
    let flights = [];

    Object.keys(localStorage).forEach(function (key) {
        let flight = JSON.parse(localStorage.getItem(key));
        flights.push(flight);
    });

    flights.sort(function (a, b) {
        return a.flightTimeStamp - b.flightTimeStamp;
    });

    return flights;
}

//load flight data from localStorage and create table elements
function loadData() {
    let flights = getFlights();

    const flightLoggerTable = getEle("flightLogs"); //.getElementsByTagName('tbody')[0];

    for (let i = 0; i < flights.length; i++) {
        const flightLog = flights[i];

        const newRow = flightLoggerTable.insertRow(0);
        newRow.id = flightLog.flightID;

        let cellCounter = 0;

        const flightDateCell = newRow.insertCell(cellCounter++);
        flightDateCell.appendChild(document.createTextNode(flightLog.flightDate));

        // const flightStartedTime = flightLog.flightStartedHour + ":" + flightLog.flightStartedMinute;
        // const flightStartedCell = newRow.insertCell(cellCounter++);
        // flightStartedCell.appendChild(document.createTextNode(flightStartedTime));

        // const flightEndedTime = flightLog.flightEndedHour + ":" + flightLog.flightEndedMinute;
        // const flightEndedCell = newRow.insertCell(cellCounter++);
        // flightEndedCell.appendChild(document.createTextNode(flightEndedTime));

        const flightPlaneNameCell = newRow.insertCell(cellCounter++);
        flightPlaneNameCell.appendChild(document.createTextNode(flightLog.flightPlaneName));

        const flightTypeCell = newRow.insertCell(cellCounter++);
        flightTypeCell.appendChild(document.createTextNode(flightLog.flightType));

        const flightMissionCell = newRow.insertCell(cellCounter++);
        flightMissionCell.appendChild(document.createTextNode(flightLog.flightMission));

        const flightKillsCell = newRow.insertCell(cellCounter++);
        flightKillsCell.appendChild(document.createTextNode(flightLog.flightKills));

        const flightDetailsCell = newRow.insertCell(cellCounter++);
        let detailsButton = document.createElement("button");
        detailsButton.id = flightLog.flightID;
        detailsButton.title = "View this Flight Log's Details";
        detailsButton.classList.add("btn");
        detailsButton.classList.add("btn-outline-success");
        detailsButton.classList.add("detailsButton");
        detailsButton.innerHTML = "<i class='fa fa-book'></i> Details";
        flightDetailsCell.appendChild(detailsButton);

        const editFlightLogCell = newRow.insertCell(cellCounter++);
        let editButton = document.createElement("button");
        editButton.id = flightLog.flightID;
        editButton.classList.add("btn");
        editButton.classList.add("btn-outline-primary");
        editButton.classList.add("editButton");
        editButton.innerHTML = "<i class='fa fa-edit'></i> Edit";
        editFlightLogCell.appendChild(editButton);

        const deleteFlightLogCell = newRow.insertCell(cellCounter++);
        let deleteButton = document.createElement("button");
        deleteButton.id = flightLog.flightID;
        deleteButton.innerText = "Delete";
        deleteButton.classList.add("btn");
        deleteButton.classList.add("btn-outline-danger");
        deleteButton.classList.add("deleteButton");
        deleteButton.innerHTML = "<i class='fa fa-trash'></i> Delete";
        deleteFlightLogCell.appendChild(deleteButton);
    }
}

//add a details feature to all detailsButtons. this will trigger a modal showing the details of a flight
function addDetailsFeature() {
    let detailsButtons = document.getElementsByClassName("detailsButton");

    for (let i = 0; i < detailsButtons.length; i++) {
        detailsButtons[i].onclick = function () {
            const flightLog = JSON.parse(localStorage.getItem(detailsButtons[i].id));
            getEle("dateDetails").innerText = flightLog.flightDate;
            getEle("startedDetails").innerText = flightLog.flightStartedHour + ":" + flightLog.flightStartedMinute;
            getEle("endedDetails").innerText = flightLog.flightEndedHour + ":" + flightLog.flightEndedMinute;
            getEle("planeDetails").innerText = flightLog.flightPlaneName;
            getEle("typeDetails").innerText = flightLog.flightType;
            getEle("missionDetails").innerText = flightLog.flightMission;
            getEle("killsDetails").innerText = flightLog.flightKills;
            getEle("notesDetails").innerText = flightLog.flightNotes;
            getEle("flightTimeStampDetails").innerText = new Date(flightLog.flightTimeStamp).toString();
            $("#detailsModal").modal();
        }
    }
}


//add an edit feature to all editButtons so the user can edit a flight log
function addEditFeature() {
    let editButtons = document.getElementsByClassName("editButton");

    for (let i = 0; i < editButtons.length; i++) {
        editButtons[i].onclick = function () {
            // editFlightLog(editButtons[i].id);
            const flightLog = JSON.parse(localStorage.getItem(editButtons[i].id));

            sessionStorage.setItem("editID", flightLog.flightID);
            sessionStorage.setItem("editTimeStamp", flightLog.flightTimeStamp);

            getEle("flightDate").value = flightLog.flightDate;
            getEle("flightStartedHour").value = flightLog.flightStartedHour;
            getEle("flightStartedMinute").value = flightLog.flightStartedMinute;
            getEle("flightEndedHour").value = flightLog.flightEndedHour;
            getEle("flightEndedMinute").value = flightLog.flightEndedMinute;
            getEle("flightPlaneName").value = flightLog.flightPlaneName;
            getEle("flightType").value = flightLog.flightType;
            getEle("flightNotes").value = flightLog.flightNotes;
            getEle("flightKills").value = flightLog.flightKills;
            getEle("flightMission").value = flightLog.flightMission;

            getEle("editFlightLog").classList.remove("d-none");
            getEle("addFlightLog").classList.add("d-none");

            $("#flightModal").modal();
        }
    }
}

//add a delete feature to all deleteButtons. this removes the item from localStorage
function addDeleteFeature() {
    let deleteButtons = document.getElementsByClassName("deleteButton");

    for (let i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].onclick = function () {
            const proceed = window.confirm("Are you sure you want to delete this flight log?");
            if (proceed) {
                localStorage.removeItem(deleteButtons[i].id);
                location.reload();
            }
        }
    }
}

//edit a flight log. set the inputs to the modal elements to the flight's values
function editFlightLog(flightID) {
    const flightLog = JSON.parse(localStorage.getItem(flightID));

    getEle("flightDate").value = flightLog.flightDate;
    getEle("flightStartedHour").value = flightLog.flightStartedHour;
    getEle("flightStartedMinute").value = flightLog.flightStartedMinute;
    getEle("flightEndedHour").value = flightLog.flightEndedHour;
    getEle("flightEndedMinute").value = flightLog.flightEndedMinute;
    getEle("flightPlaneName").value = flightLog.flightPlaneName;
    getEle("flightType").value = flightLog.flightType;
    getEle("flightNotes").value = flightLog.flightNotes;
    getEle("flightKills").value = flightLog.flightKills;
    getEle("flightMission").value = flightLog.flightMission;

    getEle("editFlightLog").classList.remove("d-none");
    getEle("saveFlightLog").classList.add("d-none");
}

//save the edits to the flight
function updateFlightLog() {
    const flightID = sessionStorage.getItem("editID");
    const flightTimeStamp = Number(sessionStorage.getItem("editTimeStamp")); //the sessionStorage stores this as a string - so coerce back into a number
    const flightDate = getVal("flightDate");
    const flightStartedHour = getVal("flightStartedHour");
    const flightStartedMinute = getVal("flightStartedMinute");
    const flightEndedHour = getVal("flightEndedHour");
    const flightEndedMinute = getVal("flightEndedMinute");
    const flightPlaneName = getVal("flightPlaneName");
    const flightType = getVal("flightType");
    const flightNotes = getVal("flightNotes");
    const flightKills = getVal("flightKills");
    const flightMission = getVal("flightMission");

    //format time
    if (flightStartedMinute.length != 2) {
        flightStartedMinute = flightStartedMinute.padStart(2, "0");
    }

    if (flightEndedMinute.length == 1) {
        flightEndedMinute = flightEndedMinute.padStart(2, "0");
    }

    const flightLog = {
        "flightID": flightID,
        "flightTimeStamp": flightTimeStamp,
        "flightDate": flightDate,
        "flightStartedHour": flightStartedHour,
        "flightStartedMinute": flightStartedMinute,
        "flightEndedHour": flightEndedHour,
        "flightEndedMinute": flightEndedMinute,
        "flightPlaneName": flightPlaneName,
        "flightType": flightType,
        "flightKills": flightKills,
        "flightNotes": flightNotes,
        "flightMission": flightMission
    };

    if (isFlightLogValid(flightLog)) {
        localStorage.setItem(flightID, JSON.stringify(flightLog));
        location.reload();
    }
}

//set the defaults of the "Add new Flight" modal input elements
function setDefaults() {
    if (getEle("addFlightLog").classList.contains("d-none")) {
        getEle("addFlightLog").classList.remove("d-none");
        getEle("editFlightLog").classList.add("d-none");
    }

    const firstRow = $("tbody > :first-child");

    //no records have been added, return. the jQuery first row selecter returns an array of length 0
    let date = new Date();
    if (firstRow.length == 0) {
        //Set default date/time inputs
        getEle("flightDate").value = date.toLocaleDateString();
        getEle("flightStartedHour").value = date.getHours();
        getEle("flightStartedMinute").value = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        getEle("flightEndedHour").value = date.getHours();
        getEle("flightEndedMinute").value = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        return;
    }

    //set defaults to the top row (Latest entry)
    const latestFlightID = firstRow[0].id;
    const latestFlightLog = JSON.parse(localStorage.getItem(latestFlightID));

    getEle("flightDate").value = date.toLocaleDateString();
    getEle("flightStartedHour").value = latestFlightLog.flightEndedHour;
    getEle("flightStartedMinute").value = latestFlightLog.flightEndedMinute;
    getEle("flightEndedHour").value = latestFlightLog.flightEndedHour;
    getEle("flightEndedMinute").value = latestFlightLog.flightEndedMinute;
    getEle("flightPlaneName").value = latestFlightLog.flightPlaneName;
    getEle("flightKills").value = "0";
    getEle("flightNotes").value = "";
    getEle("flightMission").value = "";
}

//delete all flights from localStorage
function clearlocalStorage() {
    let input = window.prompt("Are you absolutely sure you want to delete all the data? Enter 'Yes' to confirm.");

    if (input.toLowerCase().trim() === "yes") {
        window.alert("Deleting all data...");
        localStorage.clear();
        location.reload();
    }
    else {
        window.alert("Cancelled.");
    }
}

// for testing - make fake/random data
function generateRandomData() {
    getEle("flightDate").valueAsDate = new Date(new Date().setHours(rand(180)));
    getEle("flightStartedHour").value = rand(24) - 1;
    getEle("flightStartedMinute").value = rand(49) + 10;
    getEle("flightEndedHour").value = rand(24) - 1;
    getEle("flightEndedMinute").value = rand(49) + 10;
    getEle("flightPlaneName").value = makeRandomGuid(rand(8) + 3);
    getEle("flightType").selectedIndex = rand(2) - 1;

    let notes = "";
    for (let i = 0; i < rand(8); i++) {
        notes += makeRandomGuid(rand(6) * i + 1);
    }

    getEle("flightNotes").value = notes;

    addFlightLog();
}

//get a random number between 1 and max
//ex: rand(5) can return 1,2,3,4, and 5
function rand(max) {
    return Math.floor(Math.random() * max) + 1;
}

//generate a random string https://stackoverflow.com/a/1349426
function makeRandomGuid(length) {
    if (typeof (length) === 'undefined') {
        length = 6; //default of 56,800,235,584 possibilities: 26 + 26 + 10, then to the 6th power. (62^6) ~57 billion permutations
    }

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let guid = "";

    for (let i = 0; i < length; i++) {
        guid += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return guid;    
}

//download the data in localStorage
function saveData(asJson) {
    let flights = [];

    Object.keys(localStorage).forEach(function (key) {
        let flight = localStorage.getItem(key);
        flights.push(flight);
    });

    const element = document.createElement("a");

    if (asJson) {
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(flights));
        element.setAttribute("download", "flight_logger_" + makeRandomGuid(3) + ".json");
    }
    else {
        element.setAttribute("href", "data:text/plain;charset=utf-8," + buildCsvText(flights));
        element.setAttribute("download", "flight_logger_" + makeRandomGuid(3) + ".csv");
    }

    element.style.display = "none";
    document.body.appendChild(element);

    //initiate the download
    element.click();

    document.body.removeChild(element);
}

// build a csv string of the flights for downloading
function buildCsvText(flights) {
    const header = "Flight ID,Time Stamp (unix epoch in ms),Flight Date,Start Hour,Start Minute,End Hour,End Minute,Plane/Vehicle Name,Outcome,Victories,Notes,Mission";
    let csvStringBuilder = "";
    csvStringBuilder += header + "\n";
    
    for (let i = 0; i < flights.length; i++) {
        let flight = JSON.parse(flights[i]);
        
        Object.values(flight).forEach(function (_value) {
            let v = _value.toString();
            
            //"escape" the csv string by adding double quotes around the value if it contained a comma https://tools.ietf.org/html/rfc4180
            if (v.includes(',')) {
                v = "\"" + v + "\"";
            }

            if (v.length === 0) {
                v = "-";
            }

            csvStringBuilder += v + ",";
        });
        csvStringBuilder += "\n";
    }

    return csvStringBuilder;
}
