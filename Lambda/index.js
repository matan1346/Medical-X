/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');

//const Promise = require('promise');
 const AWS = require('aws-sdk');

  const ddb = new AWS.DynamoDB.DocumentClient();



const myData = [];
const patientsData = [];

const AddPatientHandler = {
  canHandle(handlerInput){
     const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return (request.type === 'IntentRequest'
        && request.intent.name === 'AddPatientIntent');
  },handle(handlerInput) {
   
   
   const slots = handlerInput.requestEnvelope.request.intent.slots;
   
   /*
   patientsData.push({
     'patientName': slots.patientName.value,
     'pulse' : slots.pulse.value,
     'bloodPressure': slots.bloodPressure.value,
     'breaths': slots.breathsPerMinute.value,
     'sugarLevel': slots.sugarLevel.value,
     'bodyTemp': slots.bodyTemp.value,
     'allergies' : slots.allergies.value,
     'medicines': slots.medicines.value
   });*/
   //patientId, blood, temp, breaths, hospital, patient, pulseVal,reporter,sugarL
   RegisterPatientField('patientName', slots.patientName.value);
   RegisterPatientField('patientID', slots.patientID.value);
   RegisterPatientField('patientBlood', slots.bloodSystolic.value + "/" + slots.bloodDiastolic.value);
   RegisterPatientField('patientPulse', slots.pulse.value);
   RegisterPatientField('patientBreaths', slots.breathsPerMinute.value);
   RegisterPatientField('patientSugar', slots.sugarLevel.value);
   RegisterPatientField('patientTemp', slots.tempFirstNumber.value + "." + slots.tempSecondNumber.value);
   RegisterPatientField('reporterName', slots.reporterName.value);
   RegisterPatientField('medicines', slots.medicines.value);
   RegisterPatientField('allergies', slots.allergies.value);

   
    const speechOutput = 'register about ' +slots.patientName.value + ' has been saved localy. You can say show, save for dsiplaying or saving the register on the database.';//+', Welcome to the app!';
    
    
  console.log(handlerInput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME,speechOutput)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const RegisterFieldTextShow  = {
  patientName: "Name",
  patientID: "Identity",
  patientTemp: "body temperature",
  patientPulse: "patient pulse",
  patientBlood: "Blood pressure",
  patientBreaths: "Breaths per minute",
  patientSugar: "Sugar level",
  
  reporterName: "Reporter Name",
  allergies: "Allergies",
  medicines: "Medicines"
};


const RegisterRequireSlots = {
    patientName: true,
    patientID: true,
    patientTemp: false,
    patientPulse: true,
    patientBlood: true,
    patientBreaths: true,
    patientSugar: false,

    reporterName: false,
    allergies: false,
    medicines: false
};

const RegisterDefaultValues  = {
    patientName: "Unknown",
    patientID: 0,
    patientTemp: "Unknown",
    patientPulse: "0",
    patientBlood: "0",
    patientBreaths: "0",
    patientSugar: "0",
    reporterName: "Unknown",
    allergies: "Unknown",
    medicines: "Unknown"
}


var RegisteredFields = {
    patientName: "",
    patientID: "",
    patientTemp: "",
    patientPulse: "",
    patientBlood: "",
    patientBreaths: "",
    patientSugar: "",
    reporterName: "",
    allergies: "",
    medicines: ""
}

function ResetRegisterFields()
{
  for(let SlotKey in RegisteredFields)
  {
    RegisteredFields[SlotKey] = RegisterDefaultValues[SlotKey];
  }
}

function getIDSplitString(ID)
{
  var textNumber = "";
  var numberChars = ID.split('');

  for(var i =0; i < numberChars.length;i++)
    textNumber += numberChars[i] + ', ';
  //textNumber += numberChars[numberChars.length-1];

  return textNumber;
}

function recoverIDFormatFromText(text)
{
  return text.replace(/,\ /g, '');
}

function GetCurrentRegisterDataText()
{
  var text = "";
  for(let SlotKey in RegisterFieldTextShow)
  {
    text = text + RegisterFieldTextShow[SlotKey] + ": ";
      if(RegisterRequireSlots[SlotKey] && RegisteredFields[SlotKey] == "")
          text = text + RegisterDefaultValues[SlotKey];
      else
      {
        var myVal = RegisteredFields[SlotKey];
        if(SlotKey == 'patientID')
        {
          myVal = getIDSplitString(myVal);
        }
        text = text + myVal;
      }
          
      text = text + "\n";
  }
  return text;
}


/*****REGISTER***** */

function CheckForEndRegister()
{
  var result = "";
  var count = 0;
    for(let requireSlot in RegisterRequireSlots)
    {
        if(RegisterRequireSlots[requireSlot] && RegisteredFields[requireSlot] == "")
        {
          if(count > 0)
            result = result + ', ';
          result = result.replace(/\|/g, '') +  "|" +RegisterFieldTextShow[requireSlot];// + " is required\n";
          count++;
        }
            //return false;
    }
    if(count == 1)
      result = result.replace(/\|/g, '') + "is required";
    else if(count > 1)
      result = result.replace(/,\ \|/g, ' and ') + "is required";

    return result;
}

function RegisterPatientField(fieldName, FieldValue)
{
    
    if(fieldName in RegisterRequireSlots && FieldValue === undefined)
    {
        FieldValue = RegisterDefaultValues[fieldName];
    }
    RegisteredFields[fieldName] = FieldValue;
    //return FieldValue;
}


//GetCurrentRegisterDataText
const RegPatientShowHandler = {
  canHandle(handlerInput){
     const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return (request.type === 'IntentRequest'
        && request.intent.name === 'RegisterPatientShowIntent');
  },handle(handlerInput) {
   
   
   

    const speechOutput =  GetCurrentRegisterDataText();
    /*
    var speechOutput = {
      speech: GetCurrentRegisterDataText(),
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };*/

  console.log(handlerInput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard('Register Patient Details',recoverIDFormatFromText(speechOutput))
      .withShouldEndSession(false)
      .getResponse();
  }
};


const RegPatientResetHandler = {
  canHandle(handlerInput){
     const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return (request.type === 'IntentRequest'
        && request.intent.name === 'ResetRegisterPatientIntent');
  },handle(handlerInput) {
   
   
    ResetRegisterFields();

    const speechOutput =  "Current register details has been reset. you can now register new values.";
    /*
    var speechOutput = {
      speech: GetCurrentRegisterDataText(),
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };*/

  console.log(handlerInput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard('Fields have been initialized',recoverIDFormatFromText(GetCurrentRegisterDataText()))
      .withShouldEndSession(false)
      .getResponse();
  }
};


//Register -PatientID 
const RegPatientIDHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientIDIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     var result = "Continue dialog...";

    RegisterPatientField('patientID', ""+slots.patientID.value);
    var displayResult = "Patient Identity Number " + getIDSplitString(RegisteredFields.patientID) + " registered.";
    var displayTitle = 'Register patient ID';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }
     

      //const speechOutput =  result;
      
     

    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle, recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

  //REGISTER - PatientName
  const RegPatientNameHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientNameIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientName', slots.patientName.value);

    var displayResult = "Patient name " + RegisteredFields.patientName + " registered.";
    var displayTitle = 'Register Patient Name';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

      //const speechOutput =  result;
      
    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

  //REGISTER - PatientTemp
  const RegPatientTempHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientTempIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientTemp', slots.tempFirstNumber.value + "." + slots.tempSecondNumber.value);

    var displayResult = "Patient body temperature " + RegisteredFields.patientTemp + " registered.";
    var displayTitle = 'Register Body Temperature';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

      //const speechOutput =  result;
      
    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

  //REGISTER - PatientPulse
  const RegPatientPulseHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientPulseIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientPulse', slots.pulse.value);

    var displayResult = "Patient pulse " + RegisteredFields.patientPulse + " registered.";
    var displayTitle = 'Register Patient Pulse';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

      //const speechOutput =  result;
      
    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

  //REGISTER - PatientSugar
  const RegPatientSugarHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientSugarIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientSugar', slots.sugarLevel.value);

    var displayResult = "Patient Sugar Level " + RegisteredFields.patientSugar + " registered.";
    var displayTitle = 'Register Sugar Level';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

      //const speechOutput =  result;
      
    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

  //REGISTER - PatientBreaths
  const RegPatientBreathsHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientBreathsIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientBreaths', slots.breathsPerMinute.value);

    var displayResult = "Patient amount breaths " + RegisteredFields.patientBreaths + " registered.";
    var displayTitle = 'Register Breaths Per Minute';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };


  //REGISTER - PatientBlood
  const RegPatientBloodHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterPatientBloodIntent');
    },handle(handlerInput) {
     
     
     const slots = handlerInput.requestEnvelope.request.intent.slots;
     //var result = "Continue dialog...";

    RegisterPatientField('patientBlood', slots.bloodSystolic.value + "/" + slots.bloodDiastolic.value);

    var displayResult = "Patient blood pressure " + RegisteredFields.patientBlood + " registered.";
    var displayTitle = 'Register Blood Pressure';
    if(CheckForEndRegister() == "")
    {
      displayResult = displayResult + REGISTER_COMPLETE;
      displayTitle = "Log Successfully completed"
    }

    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard(displayTitle,recoverIDFormatFromText(GetCurrentRegisterDataText()))
        .withShouldEndSession(false)
        .getResponse();
    }
  };



  //RegisterSaveIntent
  const RegPatientSaveHandler = {
    canHandle(handlerInput){
       const request = handlerInput.requestEnvelope.request;
      console.log(handlerInput);
      return (request.type === 'IntentRequest'
          && request.intent.name === 'RegisterSaveIntent');
    },handle(handlerInput) {
     
      var displayResult = "";
      var cardTitle = "";
      var getRequiredMessage = CheckForEndRegister();

    if(getRequiredMessage == "")
    {
      //recordPatient(patientId, blood, temp, breaths, patient, pulseVal,reporter,sugarL, medicines, allergies) {
      recordPatient(
        RegisteredFields.patientID,
        RegisteredFields.patientBlood,
        RegisteredFields.patientTemp,
        RegisteredFields.patientBreaths,
        RegisteredFields.patientName,
        RegisteredFields.patientPulse,
        RegisteredFields.reporterName,
        RegisteredFields.patientSugar,
        RegisteredFields.medicines,
        RegisteredFields.allergies

      );
        cardTitle = "Save Register Data";
      displayResult = REGISTER_COMPLETE;
        ResetRegisterFields();
    }
    else
    {
      cardTitle = "Register Required details"
      displayResult = getRequiredMessage
    }
      
      
    console.log(handlerInput);
      return handlerInput.responseBuilder
        .speak(displayResult)
        .withSimpleCard('Save Register Data', (displayResult))
        .withShouldEndSession(false)
        .getResponse();
    }
  };

function getPatient(patientName)
{
  var results = [];
  for(var i = 0;i < patientsData.length;i++)
    if(patientsData[i].patientName == patientName)
      results.push(patientsData[i]);
  return results;
}

function getPatientsText(patients)
{
  var st = '';
    
  for(var i =0;i < patients.length;i++)
  {
     st = st + 'Patient Name: '+ patients[i].firstName + ':';
     st = st + 'pulse: ' + patients[i].pulse + '.';
     st = st + 'blood pressure: ' + patients[i].bloodPressure + '.';
     st = st + 'breaths: ' + patients[i].breaths + '.';
     st = st + 'sugar level: ' + patients[i].sugarLevel + '.';
     st = st + 'body temp: ' + patients[i].bodyTemp + '.';
     st = st + 'allergies: ' + patients[i].allergies + '.';
     st = st + 'medicines: ' + patients[i].medicines + '.';
  }
  return st;
}

function switchVoice(text,voice_name) {
  if (text){
    return "<voice name='" + voice_name + "'>" + text + "</voice>"
  }
}

const GetPatientHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetPatientIntent');
  },
  handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    var results = getPatient(slots.patientName.value);
   
    const speechOutput =  getPatientsText(results);
    speechOutput = 'I have found ' + results.length + ' patients named ' +slots.patientName.value+'.' + speechOutput;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME,speechOutput)
      .getResponse();
  },
};

const GetAllPatientsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'GetAllPatientsIntent');
  },
  handle(handlerInput) {
   

    var resultText =  getPatientsText(patientsData);
    
     
    var speechOutput = 'I got ' + patientsData.length + ' patients information.';
    if(patientsData.length > 0)
      speechOutput = speechOutput + 'Here is a list of them:' + resultText;
   
    
    //const str = "Baby shark by The band: " + switchVoice("Baby shark tatoo tatoo tatoo.","Matthew") + switchVoice("Baby shark tatoo tatoo tatoo..","Kendra") + switchVoice("Baby shark tatoo tatoo tatoo.","Ivy") + " Baby shark....."

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withSimpleCard(SKILL_NAME,speechOutput)
      .getResponse();
  },
};


function getLastLogin() {
  
  var table = "patients";

var id = 875;

var params = {
    TableName: table,
    Key:{
        "id": id
       
    }
};

  //return ddb.get(params).promise();
}







function GetPatientDB()
{
  
  var result = "test1";
  /*
  var table = "patients";

var id = 1;

var params = {
    TableName: table,
    Key:{
        "identityNumber": id
       
    }
};

ddb.getItem(params, function(err, data) {
    //return 'MATAN';
    if (err) {
       result = "could not retrieve data";// console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        result = "Test";//JSON.stringify(data, null, 2);//data;// console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});
  */

 var params = {
  Key: {
   "patientName": {
     S: "matan"
    }
  }, 
  TableName: "patients"
 };
 ddb.getItem(params, function(err, data) {
   if (err)
   {
     result = "Not Found";
    console.log(err, err.stack); // an error occurred
   } 
   else {
     result = "Found!";
    console.log(data);           // successful response
   } 
   /*
   data = {
    Item: {
     "AlbumTitle": {
       S: "Songs About Life"
      }, 
     "Artist": {
       S: "Acme Band"
      }, 
     "SongTitle": {
       S: "Happy Day"
      }
    }
   }
   */
 });

  return result;
}

function recordPatient(patientId, blood, temp, breaths, patient, pulseVal,reporter,sugarL, medicines, allergies) {
    if(patientId == 0 || patientId == "")
      patientId = RegisterDefaultValues.patientID;
    if(blood == 0 || blood == "")
      blood = RegisterDefaultValues.patientBlood;
    if(temp == 0 || temp == "")
      temp = RegisterDefaultValues.patientTemp;
    if(breaths == 0 || breaths == "")
      breaths = RegisterDefaultValues.patientBreaths;
    
    if(patient == 0 || patient == "")
      patient = RegisterDefaultValues.patientName;
    if(pulseVal == 0 || pulseVal == "")
      pulseVal = RegisterDefaultValues.patientPulse;
    if(reporter == 0 || reporter == "")
      reporter = RegisterDefaultValues.reporterName;//RegisterDefaultValues.patientID;
    if(sugarL == 0 || sugarL == "")
      sugarL = RegisterDefaultValues.patientSugar;
    if(medicines == 0 || medicines == "")
      medicines = RegisterDefaultValues.medicines;
    if(allergies == 0 || allergies == "")
      allergies = RegisterDefaultValues.allergies;

      var today = new Date();
      var day = String(today.getDate()).padStart(2, '0');
      var month = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var year = today.getFullYear();
      
        var hour = today.getHours();
        var minute = today.getMinutes();
        var second = today.getSeconds();

        if(hour < 10) hour = "0" + hour;
        if(minute < 10) minute = "0" + minute;
        if(second < 10) second = "0" + second;

     var todayDate = day + '/' + month + '/' + year;
     var   todayTime = hour + ":" + minute + ":" + second; 


    return ddb.put({
        TableName: 'patients',
        Item: {

            id: parseInt(patientId),/*new Date().getUTCMilliseconds(),*/
            identityNumber: patientId,
            bloodPressure: blood,
            bodyTemperature : temp,
            breathsPerMinute: breaths,
            patientName: patient,
            pulse: pulseVal,
            reporterName: reporter,
            sugarLevel: sugarL,
            medicines: medicines,
            allergies: allergies,
            dateString: todayDate,
            timeString: todayTime
            /*User: username,
            Unicorn: unicorn,
            UnicornName: unicorn.Name,
            RequestTime: new Date().toISOString(),*/
        },
    }).promise();
}
/*
module.exports.getItem = itemID => {
  const params = {
    TableName: "patients",
    Key: {
      id: itemID
    }
  };

  return ddb.get(params).promise().then(result => {
    return result.item;
  });
  
};*/

const PatientHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    console.log(handlerInput);
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'PatientIntent');
  },
  handle(handlerInput) {
   

   
    const speechOutput = 'Welcome to MedicaLEX';//'MATAN Welcome to the Patient Data Center! You can Add new patient data, get patient information, and so on, for full action please say patient help';
  
var ImageObj = {
  smallImageUrl: 'https://patientbucket-35xyz.s3.us-east-2.amazonaws.com/blood_pressure.jpg',
  largeImageUrl: 'https://patientbucket-35xyz.s3.us-east-2.amazonaws.com/patient_id.jpg'
};

  console.log(speechOutput);
    return handlerInput.responseBuilder
      .speak(speechOutput)/* + st)*/
      .withSimpleCard("Register Patient Details"/*SKILL_NAME*/,recoverIDFormatFromText(GetCurrentRegisterDataText()), ImageObj)/* + st)*/
      .withShouldEndSession(false)
      .getResponse();
  },
};


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .withSimpleCard("Help Menu",HELP_MESSAGE)
      .withShouldEndSession(false)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    ResetRegisterFields();

    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Patient Details';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can use one of the following voice command: \n-add patient\n-register field, (for example: register id)';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Get well soon!';
const REGISTER_COMPLETE = "Patient Registered on the server";

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    PatientHandler,
    RegPatientShowHandler,
    RegPatientIDHandler,
    RegPatientNameHandler,
    RegPatientTempHandler,
    RegPatientBreathsHandler,
    RegPatientPulseHandler,
    RegPatientSugarHandler,
    RegPatientBloodHandler,
    AddPatientHandler,
    GetPatientHandler,
    GetAllPatientsHandler,
    RegPatientResetHandler,
    RegPatientSaveHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
