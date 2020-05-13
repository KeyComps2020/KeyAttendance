import React, { Component } from 'react';
import { Button, ButtonToolbar, Form, FormControl, FormGroup, Label, ListGroup, ListGroupItem } from "react-bootstrap";
import { Redirect } from 'react-router-dom';
import Autocomplete from '../components/Autocomplete';
import Heatmap from '../components/Heatmap';
import { dateToString, getPermissions, domain, getEarlierDate, getNextSaturday, getPrevSunday, httpDelete, httpGet, httpPatch, httpPost, protocol, httpPostFile, httpPatchFile, httpGetFile } from '../components/Helpers';
import blankPic from '../images/blank_profile_pic.jpg';
import AddFlagModal from '../components/AddFlagModal';
import FlagOptions from '../components/FlagOptions';
import ReactCollapsingTable from 'react-collapsing-table';
import continuousColorLegend from 'react-vis/dist/legends/continuous-color-legend';

class Students extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mode: 'search',
      canViewStudentInfo: false,
      canViewHeatmap: false,
      canDeleteStudent: false,
      heatMapJson: [],
      canViewFlags: false,
      flagsJson: [],
      showFlagModal: false,
      flagRows: [],
      flags: {"Food Insecurity": false, "Housing Insecurity": false, "Mental Health": false, "Acedemics/Employment": false}
    };
    this.display = this.display.bind(this);
    this.edit = this.edit.bind(this);
    this.handler = this.handler.bind(this);
    this.refresh = this.refresh.bind(this);
    this.flag = this.flag.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.removeFlagRow = this.removeFlagRow.bind(this);
  }


  refresh() {
    this.getStudentProfile(this.state)
}

  async componentDidMount() {
    try {
      var studentsJson = await httpGet(`${protocol}://${domain}/api/students/`);
      var suggestionsArray = this.makeSuggestionsArray(studentsJson);
      let permissions = getPermissions()
      let canViewStudentInfo = false;
      let canViewStudentKey = false;
      if (permissions.indexOf('view_studentinfo') >= 0) {
        var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
        var profileInfo = this.parseCols(studentColumnJson);
        var profileInfoPrelim = this.parseCols(studentColumnJson);
        canViewStudentInfo = true;
      }
      let canViewHeatmap = false;
      if (permissions.indexOf('view_reports') >= 0) {
        canViewHeatmap = true;
      }
      if (permissions.indexOf('view_cityspanstudents') >= 0){
        canViewStudentKey = true;
      }
      let canDeleteStudent = false;
      if (permissions.indexOf('delete_students') >= 0) {
        canDeleteStudent = true;
      }
      let canViewFlags = false;
      if (permissions.indexOf('add_studentflags') >= 0){
           canViewFlags = true;
      }

      this.setState(function (previousState, currentProps) {
        return {
          mode: 'search',
          suggestionsArray: suggestionsArray,
          studentColumnJson: studentColumnJson,
          profileInfo: profileInfo,
          profileInfoPrelim: profileInfoPrelim,
          id: null,
          canViewStudentInfo: canViewStudentInfo,
          canViewHeatmap: canViewHeatmap,
          uploadedPic: false,
          src: null,
          picUpdated: false,
          canDeleteStudent: canDeleteStudent,
          canViewStudentKey: canViewStudentKey,
          canViewFlags: canViewFlags
        };
        
      });
    } catch (e) {
      console.log(e);
    }
  }

  makeSuggestionsArray(suggestions) {
    var array = [];
    var lastHolder1;
    var lastHolder2;
    var tempArray;
    for (var object in suggestions) {
      if (suggestions[object]['last_name'].includes(" ")) {
        tempArray = suggestions[object]['last_name'].split(" ");
        lastHolder1 = tempArray[0];
        lastHolder2 = tempArray[1];
      }
      else {
        lastHolder1 = suggestions[object]['last_name'];
        lastHolder2 = "";
      }
      array.push({
        studentKey: suggestions[object]['student_key'],
        firstName: suggestions[object]['first_name'],
        lastName1: lastHolder1,
        lastName2: lastHolder2,
        id: suggestions[object]['id']
      });
    }
    return array;
  }

  parseCols(cols) {
    cols.sort(this.sortCols);
    
    var profileInfo = [];
    for (var col in cols) {
      profileInfo[col] = {
        studentInfoId: null,
        colInfo: cols[col],
        value: null,
        type: null,
        updated: false,
        patchPost: {
          'student_id': null,
          'info_id': parseInt(col) + 1,
          'int_value': null,
          'str_value': null,
          'bool_value': null,
          'date_value': null,
          'time_value': null,
          'photo_value': null,
          'id': null
        }
      }
    }

    return profileInfo;
  }
  
  // Could be used to create a custom layout for the fields on the student profile page
  sortCols(a, b) {
    if (a.info_id > b.info_id) return 1;
    if (a.info_id < b.info_id) return -1;
    return 0;
  }

  handler(e, studentId) {
    var preState = {
      mode: 'display',
      id: studentId,
      profileInfo: this.state.profileInfo,
      profileInfoPrelim: this.state.profileInfoPrelim
    };
    this.getStudentProfile(preState);
  }

  async getStudentProfile(state) {
    try {
      const studentProfileJson = await httpGet(`${protocol}://${domain}/api/students/?id=` + state.id);
      state.profileData = studentProfileJson;
      const studentProfileEx = await httpGet(`${protocol}://${domain}/api/student_info/?student_id=${state.id}`);
      
      for (var i in studentProfileEx) {
        if (studentProfileEx[i].photo_url !== null && this.state.picUpdated == false) {
          var objectUrl = `${protocol}://${domain}/${studentProfileEx[i].photo_url}`;
          this.setState({src: objectUrl, uploadedPic: true});
        }
      }
      this.setState({picUpdated: false});
      
      // Deep copy
      state.profileDataPrelim = JSON.parse(JSON.stringify(studentProfileJson));
      if (this.state.canViewStudentInfo) {
        try {
          const studentInfoJson = await httpGet(`${protocol}://${domain}/api/student_info/?student_id=${state.id}`);
          if (studentInfoJson.length === 0) {
            var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
            state.profileInfo = this.parseCols(studentColumnJson);
            state.profileInfoPrelim = this.parseCols(studentColumnJson);
            state = this.addTypes(state);
          } else {
            var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
            state.profileInfo = this.parseCols(studentColumnJson);
            state.profileInfoPrelim = this.parseCols(studentColumnJson);
            state = this.addTypes(state);

            var returnedState = this.parseStudentInfo(state, studentInfoJson);
            state.profileInfo = returnedState.profileInfo;
            state.profileInfoPrelim = returnedState.profileInfoPrelim;
          }
        }
        catch (e) {
          var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
          state.profileInfo = this.parseCols(studentColumnJson);
        }
      }

      //get heatmap data for past 28 days (past 4 wks) up to the previous sunday ("the starting sunday")
      // to the saturday which ends this current week (i.e. "the ending saturday")
      //this ensures we are always getting exactly 5 weeks worth of data
      // also gets flags for the past week 
      var startDate = getEarlierDate(28);
      startDate = getPrevSunday(startDate);
      var startDateString = dateToString(startDate);
      state.startDateString = startDateString;
      var today = getEarlierDate(0);
      var todayDateString = dateToString(today);
      var weekEarlier = getEarlierDate(7);
      var weekEarlierString = dateToString(weekEarlier);
      var endDate = getNextSaturday(today);
      var endDateString = dateToString(endDate);
      state.endDateString = endDateString;
      
      if (this.state.canViewHeatmap) {
        const heatMapJson = await httpGet(`${protocol}://${domain}/api/reports/individualHeatmap/?student_id=${state.id}&startdate=${startDateString}&enddate=${endDateString}`);
        state.heatMapJson = heatMapJson;
      }

      if (this.state.canViewFlags){
        const flagsJson = await httpGet(`${protocol}://${domain}/api/flags/?student_id=${state.id}&date=${todayDateString}&startdate=${weekEarlierString}&type=${"oneWeek"}`);
        state.flagsJson = flagsJson['notifications'];
        this.buildFlagRows(state.flagsJson);
      }
      this.setState(function (previousState, currentProps) {
        return state;
      });
    }
    catch (e) {
      console.log(e);
    }
  }

  async updateStudentInfo() {
    const studentInfoJson = await httpGet(`${protocol}://${domain}/api/student_info/?student_id=${this.state.id}`);
    var returnedState = this.parseStudentInfo(this.state, studentInfoJson);

    this.setState(function (previousState, currentProps) {
      return {
        profileInfo: returnedState.profileInfo,
        profileInfoPrelim: returnedState.profileInfoPrelim
      };
    });
  }

  addTypes(state) {
    for (var entry in state.profileInfo) {
      state.profileInfo[entry].patchPost.student_id = state.id;
      state.profileInfoPrelim[entry].patchPost.student_id = state.id;

      // Ensure all varchar(x) types get caught as str_value
      if ((/varchar.*/g).test(state.profileInfo[entry].colInfo.type)) {
        state.profileInfo[entry].type = 'str_value';
        state.profileInfoPrelim[entry].type = 'str_value';
      } else {
        state.profileInfo[entry].type = state.profileInfo[entry].colInfo.type + '_value';
        state.profileInfoPrelim[entry].type = state.profileInfo[entry].colInfo.type + '_value';
      }
    }
    return state;
  }

  parseStudentInfo(state, info) {
    for (var entry in state.profileInfo) {
      state.profileInfo[entry].patchPost.student_id = state.id;
      state.profileInfoPrelim[entry].patchPost.student_id = state.id;

      var type;
      if ((/varchar.*/g).test(state.profileInfo[entry].colInfo.type)) {
        state.profileInfo[entry].type = 'str_value';
        state.profileInfoPrelim[entry].type = 'str_value';
      } else {
        state.profileInfo[entry].type = state.profileInfo[entry].colInfo.type + '_value';
        state.profileInfoPrelim[entry].type = state.profileInfo[entry].colInfo.type + '_value';
      }
    }

    for (var item in info) {
      var infoId = info[item].info_id;
      state.profileInfo[infoId - 1].patchPost = info[item];
      state.profileInfoPrelim[infoId - 1].patchPost = info[item];

      state.profileInfo[infoId - 1].studentInfoId = info[item].id;
      state.profileInfoPrelim[infoId - 1].studentInfoId = info[item].id;

      type = state.profileInfo[infoId - 1].type;
      state.profileInfo[infoId - 1].value = info[item][type];
      state.profileInfoPrelim[infoId - 1].value = info[item][type];
    }

    return state;
  }

  styleDesign()  {
    return {
      background: '#f8f8f8',
      margin: '5px',
      borderRadius: 'inherit',
      padding: '10px',
      borderColor: '#e7e7e7',
      borderStyle: 'solid',
      borderWidth: 'thin'
  }
  };

  search() {
    var preState = {
      mode: 'search',
      id: this.state.id,
      profileInfo: this.state.profileInfo,
      profileInfoPrelim: this.state.profileInfoPrelim
    };
    this.getStudentProfile(preState);
  }

  display() {
    var preState = {
      mode: 'display',
      id: this.state.id,
      profileInfo: this.state.profileInfo,
      profileInfoPrelim: this.state.profileInfoPrelim
    };
    this.getStudentProfile(preState);
  }

  edit() {
    this.setState({ mode: 'edit' });
  }
  //opens the page that let's admin view recent flags
  flag(){
    this.setState( {mode: 'flag' });
  }
  
  async delete(evt, state) {
    evt.preventDefault();
    // Ensure we have studentInfoIds from the most recent POSTs
    var newState = {
      mode: 'search',
      id: this.state.id,
      profileInfo: this.state.profileInfo,
      profileInfoPrelim: this.state.profileInfoPrelim
    };

    try {
      const studentInfoJson = await httpGet(`${protocol}://${domain}/api/student_info/?student_id=${state.id}`);

      if (studentInfoJson.length === 0) {
        var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
        newState.profileInfo = this.parseCols(studentColumnJson);
        newState = this.addTypes(newState);
      } else {
        var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
        newState.profileInfo = this.parseCols(studentColumnJson);
        newState = this.addTypes(newState);

        var returnednewState = this.parseStudentInfo(newState, studentInfoJson);
        newState.profileInfo = returnednewState.profileInfo;
      }
    } 
    catch (e) {
      var studentColumnJson = await httpGet(`${protocol}://${domain}/api/student_column/`);
      newState.profileInfo = this.parseCols(studentColumnJson);
    }

    httpDelete(`${protocol}://${domain}/api/students/`, state.profileData);
    //removes flags associated with this student
    var studentFlags = await httpGet(`${protocol}://${domain}/api/flags/?student_id=${state.id}&type=${"allFlags"}`);
    studentFlags = studentFlags['notifications'];
    for (var i = 0; i < studentFlags.length; i++) {
       httpDelete(`${protocol}://${domain}/api/flags/?id=${studentFlags[i].id}`);
    }
    

    // Ensure that the autocomplete removes the entry
    var entryFound = false;
      var entryIndex = 0;
      while (entryFound === false) {
        if (state.suggestionsArray[entryIndex].id === state.profileData['id']) {
          state.suggestionsArray.splice(entryIndex, 1);
          entryFound = true
        } else {
          entryIndex++;
        }
      }
      
      this.state.mode = 'search';
      this.setState(function (previousState, currentProps) {
        return state;
      });
  }

  //opens AddFlagModal
  openModal() {
    this.setState({showFlagModal: true});
  }

  //Closes AddFlagModal
  closeModal() {
    this.setState({showFlagModal: false});
  }

  handleNameChange(evt, state) {
    var changedField = evt.target.id;
    state.profileDataPrelim[changedField] = evt.target.value;
    state.profileDataUpdated = true;
    this.setState(function (previousState, currentProps) {
      return state;
    });
  }

  handleInfoChange(evt, state) {
    var changedField = parseInt(evt.target.id);
    
    var newValue = evt.target.value;
    var type = state.profileInfoPrelim[changedField].type;

    state.profileInfoPrelim[changedField].updated = true;

    // Ensure that empty strings are parsed as null values
    if (newValue === '') {
      newValue = null;
    }

    state.profileInfoPrelim[changedField].value = newValue;
    state.profileInfoPrelim[changedField].patchPost[type] = newValue;

    this.setState(function (previousState, currentProps) {
      return state;
    });
  }


  handleSubmit(evt, state) {
    evt.preventDefault();
    httpPatch(`${protocol}://${domain}/api/students/`, state.profileData)
      .then(function (result) {
        if ('error' in result) {
          result.response.then(function (response) { alert(`Error: ${response.error}`) });
        }
      });
    
    state.profileInfo = state.profileInfoPrelim;

    if (state.profileDataUpdated) {
      state.profileData = JSON.parse(JSON.stringify(state.profileDataPrelim));
      httpPatch(`${protocol}://${domain}/api/students/`, state.profileData);
    }
    var posted = false;
    for (var field in state.profileInfo) {
      var field = state.profileInfo[field];
      if (field.updated) {
        if (field.studentInfoId) {
          if (field.colInfo.name == 'photopath') {
            httpPatchFile(`${protocol}://${domain}/api/student_info/?id=` + field.studentInfoId, field.patchPost)
              .then(function (result) {
                if ('error' in result) {
                  result.response.then(function (response) { alert(`Error: ${response.error}`) });
                }
              });
          } else {
            httpPatch(`${protocol}://${domain}/api/student_info/?id=` + field.studentInfoId, field.patchPost)
              .then(function (result) {
                if ('error' in result) {
                  result.response.then(function (response) { alert(`Error: ${response.error}`) });
                }
              });
          }
        } else {
            field.patchPost.student_id = state.id;
            if (field.colInfo.name == 'photopath') {
              httpPostFile(`${protocol}://${domain}/api/student_info/`, field.patchPost)
                .then(function (result) {
                  if ('error' in result) {
                    result.response.then(function (response) { alert(`Error: ${response.error}`) });
                  } else {
                    posted = true;
                  }
                });
            }
            else {
              httpPost(`${protocol}://${domain}/api/student_info/`, field.patchPost)
                .then(function (result) {
                  if ('error' in result) {
                    result.response.then(function (response) { alert(`Error: ${response.error}`) });
                  } else {
                    posted = true;
                  }
                });
            }
        }
      }
    }
    
    if (posted) {
      this.updateStudentInfo();
    }


    // Ensure that the autocomplete component has an updated copy of the profile
    var entryFound = false;
    var entryIndex = 0;
    while (entryFound === false) {
      if (state.suggestionsArray[entryIndex].id === state.profileData['id']) {
        state.suggestionsArray[entryIndex] = {
          studentKey: state.profileData['student_key'],
          firstName: state.profileData['first_name'],
          id: state.profileData['id'],
          lastName1: state.profileData['last_name'],
          lastName2: ''
        };
        entryFound = true
      } else {
        entryIndex++;
      }
    }
    
    // Get studentinfoid
    this.getStudentProfile(state);
    this.renderDisplayInfo(this.state.profileInfo);
    state.id = state.profileData.id;
    state.mode = 'display';


    this.setState(function (previousState, currentProps) {
      return state;
    });
    

  } //end of handlesubmit

  sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  }

  compareTime(time1, time2) {
    return new Date(time1) > new Date(time2); // true if time1 is later
  }

  formatData(state) {
    //replace hyphens in date string with slashes b/c javascript Date object requires this (weird)
    var startDateString = state.startDateString;
    var endDateString = state.endDateString;
    var startDate = new Date(startDateString.replace(/-/g, '/'));
    var endDate = new Date(endDateString.replace(/-/g, '/'));
    var dateToCompare = startDate;
    var currEntryDate;
    var currIdx = 0;
    var heatMapJson = this.state.heatMapJson;

    if (heatMapJson.length === 0) {
      var firstEntry = { "date": startDateString, "daily_visits": 0 }
      heatMapJson.push(firstEntry);
    }
    //Add dummy date entries for missing dates (dates with no engagements) to json btwn start and end date
    //dateToCompare always incremented by 1
    while (this.compareTime(dateToCompare, endDate) === false) {
      //if reached the end of json but there's still dates to fill in up to the end date, stay on end entry
      if (currIdx > heatMapJson.length - 1) {
        currIdx = heatMapJson.length - 1;
      }
      currEntryDate = new Date(heatMapJson[currIdx]["date"].replace(/-/g, '/'));
      //identified missing date, so add dummy date entry for missing date
      if (this.sameDay(dateToCompare, currEntryDate) === false) {
        var dateEntryZeroEngagements = { "date": dateToCompare.toISOString().slice(0, 10), "daily_visits": 0 };
        //add entry in place if not at end of json OR final date entry has not been added yet/surpassed
        //else add to very end of json 
        if (currIdx !== heatMapJson.length - 1 || this.compareTime(currEntryDate, dateToCompare)) {
          heatMapJson.splice(currIdx, 0, dateEntryZeroEngagements);
        } else {
          heatMapJson.splice(currIdx + 1, 0, dateEntryZeroEngagements);
        }
      }
      dateToCompare.setDate(dateToCompare.getDate() + 1);
      currIdx++;
     }
  
      //Time to convert updated JSON with missing dates added in into
    //a list called processedData of {"x": integer day of week, "y": integer week # of month, "color": int num engagements per day} objs
    var processedData = [];
    var dayOfWeek, weekNum, dayEntry;
    var currDateObj;
    var strDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (var i = 0; i < heatMapJson.length; i++) {
      currDateObj = new Date(heatMapJson[i]['date'].replace(/-/g, '/'));
      dayOfWeek = strDays[currDateObj.getDay()];
      weekNum = Math.floor(i / 7);
      dayEntry = { "x": dayOfWeek, "y": (weekNum+1).toString(), "color": heatMapJson[i]['daily_visits']};
      processedData.push(dayEntry);
     }
     return processedData;
   }


  renderDisplayInfo = () => {
    let info = [];
    
    var fields = this.state.profileInfo;
    for (var field in fields) {
      if (fields[field].colInfo.is_showing === true) {
        var value = 'N/A';
        if (fields[field].value !== null && fields[field].value !== null !== '') {
          value = fields[field].value;
        }
        var innerHtml = fields[field].colInfo.name + ': ' + value;
        info.push(<ListGroupItem key={field}>{innerHtml}</ListGroupItem>);
      }
    }

    

    return info;
  }

  renderEditInfo = () => {
    let info = [];
    for (var entry in this.state.profileInfo) {
      var label = this.state.profileInfo[entry].colInfo.name + ': ';
      if (this.state.profileInfo[entry].colInfo.is_showing) {
        info.push(<Label key={entry + 'label'}>{label}</Label>)

        var type = this.state.profileInfo[entry].colInfo.type;
        info.push(<FormControl key={label} type={type} id={entry} defaultValue={this.state.profileInfo[entry].value} onChange={evt => this.handleInfoChange(evt, this.state)} />);
        info.push(<br key={entry + 'break'}/>);
      }
    }
    return info;
  }
                  
  getPic = () => {
        var pic;
        if (this.state.uploadedPic) {
          pic = this.state.src;
        } else {
          pic = blankPic;
        }
        return pic;
  }

  readImage(evt, state) {
    evt.preventDefault();
    this.setState({picUpdated: false});
    state.profileInfo = JSON.parse(JSON.stringify(state.profileInfoPrelim));
    state.profileInfoPrelim[5].value = evt.target.files[0];
    state.profileInfoPrelim[5].updated = true;
    state.profileInfoPrelim[5].patchPost.photo_value = evt.target.files[0];
    this.setState(function (previousState, currentProps) {
      return state;
    });
  }

  // Allows the FlagOptions object to  update state here
  removeFlagRow(id) {
    const {flagRows} = this.state;
    for (let i = 0; i < flagRows.length; i++) {
        if (flagRows[i]['id'] === id) {
            flagRows.splice(i, 1);
        }
    }
    this.setState({flagRows: flagRows});
  }

  // adds recent notifications to the table   
  buildFlagRows(flagsJson) {
    var sheet = [];
    var food = 0;
    var edu = 0;
    var mental = 0;
    var house = 0;
    var flags = {"Food Insecurity": false, "Housing Insecurity": false, "Mental Health": false, "Acedemics/Employment": false};
    for (var i = 0; i < flagsJson.length; i++) {
      var row = {}
      let datetime = flagsJson[i].date + " " + flagsJson[i].time.substr(0, 8);

      row['datetime'] = datetime;
      row['flags'] = flagsJson[i].flags;//the flags
      if (row['flags'].includes("Housing Insecurity")){
        house++;
      }
      if (row['flags'].includes("Food Insecurity")){
        food++;
      }
      if (row['flags'].includes("Acedemics/Employment")){
        edu++;
      }
      if (row['flags'].includes("Mental Health")){
        mental++;
      }
      if (flagsJson[i].note === null || flagsJson[i].notes === ""){
        row['notes'] = "";//empty notes
      }else{
        row['notes'] = flagsJson[i].note;//the notes
      }
      
      row['id'] = flagsJson[i].id;//flag id

      sheet.push(row);
    }
  this.setState({ flagRows: sheet });
  if (house >= 3){
    flags['Housing Insecurity'] = true;
  }
  if (food >= 3){
    flags['Food Insecurity'] = true;
  }
  if (edu >= 3){
    flags['Acedemics/Employment'] = true;
  }
  if (mental >= 3){
    flags['Mental Health'] = true;
  }
  this.setState({ flags: flags})
}

  render() {
    
    let permissions = getPermissions()
    if (permissions.indexOf('view_students') < 0) {
      return (<Redirect to='/attendance' />);
    }
    if (this.state.mode === 'search') {
      return (
        <div className='content'>
          <h1
          style={{textAlign: 'center', fontSize: '30px'}}
          > Key Students </h1>
          <div className='container-fluid no-padding' style={{display: 'table'}}>
            <div className='row justify-content-start' style={{display: 'grid'}}>
              <div className='col-md-12 to-front top-bottom-padding'>
                <Autocomplete
                  suggestions={this.state.suggestionsArray}
                  handler={this.handler}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    else if (this.state.mode === 'display') {
      let heatmap = [];
      if (this.state.canViewHeatmap) {
        heatmap = <div><h3>Student Attendance</h3>
          <p>Number of engagements for this individual student in the past month.</p>
          <p><b>Note:</b> Data is displayed chronologically, with row 1 representing the oldest week and row 5 representing the current week.</p> 
          <Heatmap data={this.formatData(this.state)} heatMapType="individualStudent" /></div>
      }
      let stuFlags = []
      let viewFlags = []
      if (this.state.canViewFlags){
        stuFlags =
          <div> 
            {this.state.flags['Food Insecurity'] && <Label bsStyle="primary"> Food Insecurity </Label>}
            {this.state.flags['Mental Health'] && <Label bsStyle="warning"> Mental Health </Label>}
            {this.state.flags['Acedemics/Employment'] && <Label bsStyle="success"> Acedemics/Employment </Label>}
            {this.state.flags['Housing Insecurity'] && <Label bsStyle="info"> Housing Insecurity </Label>}
          </div>
        viewFlags = 
        <div>
          <Button variant="btn btn-primary" onClick={this.flag}>
            Report One-on-One
          </Button>
        </div>
      }
      return (
        <div className='content'>
          <h1
          style={{textAlign: 'center', fontSize: '30px'}}
          > Student Profile </h1>
          <br />
          <div style={{display:'grid'}}>
          <div className='col-md-4 to-front top-bottom-padding'>
                <Autocomplete
                  suggestions={this.state.suggestionsArray}
                  handler={this.handler}
                />
              </div>
              
              <div 
              style={this.styleDesign()}>

          <div className='container-fluid no-padding'>
            <div className='row justify-content-start' style={{display: 'inline'}}>
              <div className='col-md-8 top-bottom-padding'>
                {stuFlags}
                <ListGroup>
                  <ListGroupItem>Name: {this.state.profileData.first_name} {this.state.profileData.last_name}</ListGroupItem>
                  { this.state.canViewStudentKey? <ListGroupItem>Student Key: {this.state.profileData.student_key} </ListGroupItem>: <ListGroupItem>Student Key: N/A </ListGroupItem>}
                  {this.renderDisplayInfo(this.state.parsedInfo)}
                </ListGroup>
                <Button variant="btn btn-primary" onClick={this.edit}>
                  Edit
                </Button>
                <Button style={{marginLeft:'10px'}} onClick={this.refresh}>Refresh</Button>
                <br/>
                {viewFlags}
			        </div>
        	</div>
		  </div>
      {heatmap}
      </div>
      </div>
		</div>
      );
    }
    //if editing

    else if (this.state.mode === 'edit') {
      let deleteButton = []
      if (this.state.canDeleteStudent) {
        deleteButton = <ButtonToolbar>
          <Button bsStyle="danger" onClick={evt => { if (window.confirm('Are you sure you wish to delete this student?')) this.delete(evt, this.state) }}>Delete</Button>
        </ButtonToolbar>
      }
      
      return (
        <div className='content'>
          <h1
          style={{textAlign: 'center', fontSize: '30px'}}
          > Student Profile </h1>
          <br />
              <div 
              style={this.styleDesign()}
              className='col-md-8 top-bottom-padding' id="root">
                <Form inline 
                className='col-md-8 top-bottom-padding' onSubmit={evt => this.handleSubmit(evt, this.state)}>
                  <FormGroup>
                    <Label>First Name: </Label>
                      <FormControl type="text" id="first_name" defaultValue={this.state.profileData.first_name} onChange={evt => this.handleNameChange(evt, this.state)} /> <br/>
                    <Label>Last Name: </Label>
                      <FormControl type="text" id="last_name" defaultValue={this.state.profileData.last_name} onChange={evt => this.handleNameChange(evt, this.state)} /> <br/>
                      <Label>Student Key: </Label>
                      
                      { this.state.canViewStudentKey?
                      <FormControl type="text" id="student_key" defaultValue={this.state.profileData.student_key} onChange={evt => this.handleNameChange(evt, this.state)} />:
                      <FormControl type="text" id="student_key" defaultValue="N/A" disabled={true} onChange={evt => this.handleNameChange(evt, this.state)} />}
                      <br/>
                    
                    {this.renderEditInfo(this.state.parsedInfo)}

                    <br/>
                    <ButtonToolbar>
                      <Button bsStyle="primary" type="submit">Submit</Button>
                      <Button bsStyle="default" onClick={this.display}>Cancel</Button>
                    </ButtonToolbar>
                    <br />
                    {deleteButton}
                  </FormGroup>
                </Form>
              </div>
            </div>
      
      );
    }
    else if(this.state.mode === 'flag'){
      
      // -->need to get the flags to show up upon checkin
      // -->test to see if a non admin can access the flags
      const rows = this.state.flagRows.map(item =>
        (
           {
               datetime: item.datetime,
               flags: item.flags,
               notes: item.notes,
               id: item.id
           }
       )
      ).sort((a, b) => {
        return b.datetime.localeCompare(a.datetime);
      });

    const columns = [
        {
            accessor: 'datetime',
            label: 'Date/Time',
            priorityLevel: 1,
            position: 1,
            minWidth: 100,
            sortable: true
        },
        {
            accessor: 'flags',
            label: 'Flag(s)',
            priorityLevel: 2,
            position: 2,
            minWidth: 100,
            sortable: true
        },
        {
            accessor: 'notes',
            label: 'Notes',
            priorityLevel: 3,
            position: 3,
            minWidth: 100,
            sortable: false
        },
        {
          accessor: 'options',
          label: 'Options',
          priorityLevel: 4,
          position: 4,
          CustomComponent: FlagOptions,
          sortable: false,
          minWidth: 100
      },
    ];
      return(
        <div className='col-md-8 top-bottom-padding'>
          <AddFlagModal studentInfo={this.state.profileData} student_id={this.state.id} show={this.state.showFlagModal} onSubmit={this.closeModal}/>
          <h1> Recent Notification Flags for {this.state.profileData.first_name} {this.state.profileData.last_name}</h1>
          <br/>
          <Button bsStyle='link' onClick={this.display}>Return to Student Porofile Display</Button>
          <br/>
          <ReactCollapsingTable
              rows = { rows }
              columns = { columns }
              column = {'time'}
              direction = {'descending'}
              showPagination={ true }
              callbacks = {{'options': this.removeFlagRow}}
          />
          <br/>
          <div align="right">
            <Button bsStyle="default" onClick={this.openModal}>Add a New Flag</Button>
          </div>
        </div>
      );
    }
  }
}

export default Students;
