// Initialize CodeMirror DOM Element
const mcm = document.getElementById("editor");
var myCodeMirror = CodeMirror(mcm, {
  value: "",
  mode:  "javascript"
});
  var container = myCodeMirror.getWrapperElement().parentNode;
  myCodeMirror.setSize(container.clientWidth, container.clientHeight);

defaultPayload = {
  "title" : "Enter your title here",
  "instructions" : "Replace with instructions",
  "template" : "Enter any prompt you want. You can use field values such as ${field1} and ${field2}",
  "continue" : false,  
  "prompt_fields" : [
      {
          "field_type":"text",
          "field_name":"field1",
          "field_label":"Field 1"
      },
      {
          "field_type":"text",
          "field_name":"field2",
          "field_label":"Field 2"
      }
  ]
}

payload = [{
  "title" : "Job Cover Letter Maker",
  "instructions" : "Enter the information for the fields below",
  "template" : "My name is ${name}. Write me a sample cover letter to obtain a ${job_title} job",
  "continue" : false,
  "prompt_fields" : [
      {
          "field_type":"text",
          "field_name":"job_title",
          "field_label":"Job Title"
      },
      {
          "field_type":"text",
          "field_name":"name",
          "field_label":"Candidate Name"
      }
  ]
},{
  "title" : "Kids Story Writer",
  "instructions" : "Enter the information for the fields below",
  "template" : "Write a kids story titled ${story_name}. Here is a summary: ${about}",
  "continue" : false,
  "prompt_fields" : [
      {
          "field_type":"text",
          "field_name":"story_name",
          "field_label":"Title"
      },
      {
          "field_type":"text",
          "field_name":"about",
          "field_label":"What is the story about?"
      }
  ]
}];

var selectedPayload = {};
container = null;

// Get config.json and populate for viewing/editing
chrome.storage.local.get(["config"])
.then(data => {
    //let jsonString = JSON.stringify(data.config,null,2);
    updateConfigBox(data.config);
  })
  .catch(error => console.error(error));

// Create Select box from localStorage
chrome.storage.local.get(["recipes"]).then((result) => {
    container = document.getElementById("chooser");
    const select = document.createElement('select');
    select.id = "mySelect";
    
    document.body.appendChild(select);
    // Add default value for new
    var option = document.createElement('option');
    option.value = "New";
    option.textContent = "New";
    select.appendChild(option);

    var values = result.recipes;
    values.forEach((key) => {
        var option = document.createElement('option');
        option.value = key.title;
        option.textContent = key.title;
        select.appendChild(option);
    });
    
    container.appendChild(select);        
});

const chooser = document.getElementById("chooser");

chooser.addEventListener('change', function handleChange(event) {
  grabJSONPayloadByName(event.target.value);
});

document.getElementById("btn_configure").addEventListener("click", function(){
  selectedPayload = myCodeMirror.getValue();
  saveJSON(selectedPayload);
});

document.getElementById("btn_save").addEventListener("click", function(){
  selectedPayload = myCodeMirror.getValue();
  chrome.storage.local.set({'config': selectedPayload}, function() {
    alert("Configuration Updated");
  });    
});


/* Function to Save/Add to storage
  ** Get recipies
  ** Cycle and match to current key.title
  ** If value is NEW then add new value to storage
  ** If found replace value with the key 
*/
function saveJSON(jsonpayload) {
  jptitle = JSON.parse(jsonpayload).title;
  console.log(jptitle);

  chrome.storage.local.get(["recipes"]).then((result) => {
    var records = result.recipes;
    var notfound = true;
    records.forEach((key,index) => {
      if(jptitle == key.title) {
          records[index] = JSON.parse(jsonpayload);
          notfound = false;
        }      
    }); 
    if (notfound) {
      records.push(JSON.parse(jsonpayload));
    }

    chrome.storage.local.set({'recipes': records}, function() {
      alert("Data Saved");
    });    


    //reclist.push(defaultPayload);
    console.log(records);
  });  

}

// Update Config Area
function updateConfigBox(jsonContent) {
  myCodeMirror.setValue(jsonContent);
}

// Cycles through the list of saved payloads and selects the payload by name
function grabJSONPayloadByName(payloadname) {
  console.log("Payload name is : " + payloadname);
    chrome.storage.local.get(["recipes"]).then((result) => {
      var values = result.recipes;   
        values.forEach((key) => {
          if(payloadname == key.title) {
              selectedPayload = JSON.stringify(key,null,2);
              updateConfigBox(selectedPayload);
            }
        });   
  });  
  
}