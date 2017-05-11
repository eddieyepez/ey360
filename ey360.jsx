//Created by: Eddie Yepez
//http://www.eyproducciones.com
//Copyright Eddie Yepez 2016

///////////////////////////////// MY VARIABLES //////////////////////////////////////////////////
var userCam;
var userCamName;  
           
//user comp
var userComp;
var userCompName;

//duplicator variables
var userDuplicateLayer;
var userDuplicateLayerName;  
var userDuplicateLayerComp;
var userDuplicateLayerCompName;

//Panel Size
var panel2k = 960; //1920 * 1080 -- was 1048
var panel4k = 1080; //3840 * 2160  // was 3840 * 1920 @ 1920 -- was 2096
var panelSize;
var is2k;
var isGrid;
var preCompSize;
var tileMove;

var scriptFolder;
var backUpFolder;
var panelComps;
var helperComps;

var userBackUp;

var autoOrientTrack;

var lightsArray = new Array();

//var aeVersion;


//Palette var
var myPalette = buildUI(this);

if(myPalette != null  && myPalette instanceof Window){
    myPalette.show();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function buildUI(thisObject){

    if(thisObject instanceof Panel){
        var myPalette = thisObject;
    }else{
        var myPalette = new Window("palette", "360 ey! Script v1.0",undefined, {resizeable: true});
    }//if(thisObject instanceof Panel)

   if(myPalette != null){
        
        var res =
        "Group { \
        orientation:'column',\
            setUp: Panel {orientation: ’column’, alignment:['fill','top'],\
            text: \"1. SET UP\",\
                setUpGrp: Group{\
                orientation:'column',\
                    qualityGrp: Group{\
                        orientation:'row',\
                        alignment: ['center','top'],\
                        btn2k: RadioButton {text:'2K' },\
                        btn4k: RadioButton {text:'4K' },\
                    }\
                    gridGrp:Group{\
                        orientation:'column',\
                        alignment: ['center','bottom'],\
                        sizeChange: Checkbox {text: 'Modify Comp Size', alignment:['left','top']},\
                        gridCheck: Checkbox {text: 'Create Grid', alignment:['left','top']},\
                    }\
                  }\
               }\
              creator: Panel {orientation: ’column’,alignment:['fill','top'],\
              text: \"2. CREATE\",\
                    createBtnGrp: Group{\
                        orientation:'column',\
                        convertBtn: Button {text: 'Convert to 360 Project', alignment:['center','top']},\
                    }\
                }\
              modifyPanel: Panel {orientation: ’column’,alignment:['fill','top'],\
              text: \"3. MODIFY TOOLS\",\
                    modifyGrp: Group{\
                        orientation:'column',\
                        toPanelSize: Button {text:'Convert to Panel Size', alignment:['center','top'] },\
                        propagate: Button {text:'Propagate Layers' },\
                        duplicator: Button {text:'Duplicator' },\
                        regenerateBtn: Button {text: 'Renegerate Camera Rig'},\
                        gridHide: Button {text:'Hide / Show Grid'},\
                    }\
                }\
              AboutPanel: Panel {orientation: ’column’,alignment:['fill','top'],\
              text: \"ABOUT\",\
                    aboutGrp: Group{\
                        orientation:'column',\
                        myInfoAbout: StaticText {text: 'Created by Eddie Yepez', alignment:['center','top']},\
                        myWebAbout: StaticText {text: 'www.eyproducciones.com', alignment:['center','top']},\
                    }\
                }\
        }";    
        
        myPalette.grp = myPalette.add(res);
        myPalette.layout.layout(true);
        myPalette.layout.resize();
        
        //initialize the 2k radiobox as true
        myPalette.grp.setUp.setUpGrp.qualityGrp.btn2k.value = true;        
        
        //initialize the grid checkbox as true
        myPalette.grp.setUp.setUpGrp.gridGrp.gridCheck.value = true;
        
        //initialize modifiers as not enabled
        myPalette.grp.modifyPanel.modifyGrp.regenerateBtn.enabled = false;
        myPalette.grp.modifyPanel.modifyGrp.gridHide.enabled = false;
        myPalette.grp.modifyPanel.modifyGrp.toPanelSize.enabled = false;
        myPalette.grp.modifyPanel.modifyGrp.propagate.enabled = false;
        myPalette.grp.modifyPanel.modifyGrp.duplicator.enabled = false;
        
        //If click the  button execute the function, dont forget to pass palette  to the function
        myPalette.grp.creator.createBtnGrp.convertBtn.onClick = function(){
                convert(myPalette);
         }//convertBtn Click
     
         myPalette.grp.modifyPanel.modifyGrp.regenerateBtn.onClick = function(){
                camRig(myPalette);
         }//newBtn Click
     
        myPalette.grp.modifyPanel.modifyGrp.gridHide.onClick = function(){
                gridUndo(myPalette);
        }
    
        myPalette.grp.modifyPanel.modifyGrp.toPanelSize.onClick = function(){
                toPanelSize(myPalette);
        }
    
        myPalette.grp.modifyPanel.modifyGrp.propagate.onClick = function(){
                propagate(myPalette);
        }
    
        myPalette.grp.modifyPanel.modifyGrp.duplicator.onClick = function(){
                theDuplicator(myPalette);
        }
        
        myPalette.onResizing = myPalette.onResize = function(){this.layout.resize();}
   
   }// if(myPalette != true)

    return myPalette;
    
}//function buildUI()

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function convert(palObj){
     
     //Begin Undo
    app.beginUndoGroup("360 Script");
     
     ///////////////////////////////// USER DEFINE VARIABLES //////////////////////////////////////////////////

       if(app.project.activeItem.selectedLayers[0] != undefined){
           
          if(app.project.activeItem.selectedLayers.length == 1){
              if(app.project.activeItem.selectedLayers[0].property("zoom") !== null){
                     //user camera
                    userCam = app.project.activeItem.selectedLayers[0];
                    userCamName = userCam.name;  
                   
                   //user comp
                    userComp = app.project.activeItem;
                    userCompName = userComp.name;
          
               }else{
                    alert("this is not a camera layer");
                    return;
                }
          } else{
            alert("Please select a single camera layer");
            return;
          }
           
       }else{
            alert("Please select a camera");
            return;
       }
           
    //Script root folder creation
    scriptFolder = app.project.items.addFolder("360 EY SCRIPT");
    scriptFolder.label = 0;
    //Back up folder creation    
    backUpFolder = app.project.items.addFolder("BACK_UP");
    backUpFolder.parentFolder = scriptFolder;
    backUpFolder.label = 0;
    //Cube Panels folder creation     
    panelComps = app.project.items.addFolder("CUBE PANELS");
    panelComps.parentFolder = scriptFolder;  
    panelComps.label = 0;
    //Helper folder creation     
    helperComps = app.project.items.addFolder("HELPER COMPS");
    helperComps.parentFolder = scriptFolder; 
    helperComps.label = 0;


    //Set a backup of the original user comp
    userBackUp = userComp.duplicate();
    userBackUp.name = "BACK_UP";
    userBackUp.parentFolder = backUpFolder;

    //define var for checking auto orient
    autoOrientTrack = userCam.autoOrient;
    
    if(palObj.grp.setUp.setUpGrp.qualityGrp.btn2k.value){
        panelSize = panel2k;
        is2k = true;
     }else{
        panelSize = panel4k;    
        is2k = false;
     }

    if(palObj.grp.setUp.setUpGrp.gridGrp.sizeChange.value){
        //change the size of  user comp
        userComp.width = panelSize;
        userComp.height = panelSize;
    }
   
    //Copy the user light layers to an array
    lightGenerator(userComp);
    
    //Create Panels preComps
    panelGenerator("FRONT", "xRotation", 0);
    panelGenerator("BACK", "yRotation", 180);
    panelGenerator("TOP", "xRotation", 90);
    panelGenerator("BOTTOM", "xRotation", -90);
    panelGenerator("LEFT", "yRotation", -90);
    panelGenerator("RIGHT", "yRotation", 90);

    //Call the function to create reference grids in all the panels
    if(palObj.grp.setUp.setUpGrp.gridGrp.gridCheck.value == true){
        for(i=1; i<=6; i++){
           gridHelper(i);
        }
        palObj.grp.modifyPanel.modifyGrp.gridHide.enabled = true;
        isGrid = true;
    }
      
    //Call the function to create the preViz Comp
    preViz();
    
     //initialize modifiers as enabled
    palObj.grp.modifyPanel.modifyGrp.regenerateBtn.enabled = true;
    palObj.grp.modifyPanel.modifyGrp.toPanelSize.enabled = true;
    palObj.grp.modifyPanel.modifyGrp.propagate.enabled = true;
    palObj.grp.modifyPanel.modifyGrp.duplicator.enabled = true;
    
    equirectangular();
    
    alert ("Successful Conversion");
    
    //end undo group
    app.endUndoGroup();
    
}//function convert

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function cameraHelpers(compToAdd, thisCamName, panelCamRotAxis, panelCamAngle){
    
    var panelCamera = compToAdd.layers.addCamera("360_"+thisCamName, [0,0]);
    panelCamera.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
    panelCamera.position = userCam.position;
    //set panel camera to be 90 degree field of view
    panelCamera.property("zoom").setValue(524);     
    //Rotate the camera according to the panel
    panelCamera.property(panelCamRotAxis).setValue(panelCamAngle);    
    //Parent Panel camera to the user reference camera
    panelCamera.parent = userCam;
    Zpos = userCam.cameraOption.zoom.value/2;
    panelCamera.property("position").setValue([0,0, Zpos]);  
    panelCamera.shy = true;
    panelCamera.locked = true;
    
}//function cameraHelpers()

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function camRig(palObj){
    
    //Begin Undo
    app.beginUndoGroup("Regenerate Camera Rig");

    regenerator("360_");
    
    alert ("Camera Rig Updated");
     //end undo group
      app.endUndoGroup();

}//function camRig

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function gridUndo(palObj){
    
    //Begin Undo
    app.beginUndoGroup("Hide / Show Grid");

    visualGrid("GRID_");
    
     //end undo group
      app.endUndoGroup();

}//function camRig


//////////////////////////////////////////////// MY FUNCTIONS //////////////////////////////////////////////////

//Pre Comp function

function panelGenerator(myName, panelCamRotAxis, panelCamAngle){
    
    //Create a new comp 
    myPreComp = app.project.items.addComp(myName, panelSize, panelSize, 1, userComp.duration, userComp.frameRate);
    myPreComp.parentFolder = panelComps;
    //set the same background color
    myPreComp.bgColor = userComp.bgColor;
     //set the same renderer
    myPreComp.renderer = userComp.renderer;
    
    //copy the lights
    for(var i = 0; i<lightsArray.length; i++){
          var theLight = lightsArray[i].copyToComp(myPreComp);
          var myCurrentLight = myPreComp.layer(1);
          //alert(lightsArray[i].lightType);
    
        //set the path for the  expression linker to work (I think it could be simplify)
        var lightPath = "comp(\"" + userCompName + "\").layer(\"" + userComp.layer(lightsArray[i].name).name + "\")";
        //call the function to link properties with expressions
        expressionLinker(myCurrentLight, lightPath);
  
     }// for(var i = 0; i<lightsArray.length; i++){

    
    //add the user comp as a preComp
    myPreComp.layers.add(userComp);
    //define panel comp
    myPanel = myPreComp;
    //var myPanel = app.project.item(1);
    //collapse transformations for user preComp layer
    myPanel.layer(1).collapseTransformation = true;
    //Locked and shy
    myPanel.layer(1).shy = true;
    myPanel.layer(1).locked = true;
    
    //Call cameraGenerator Function
    cameraGenerator(myPanel, "360_userCamRef", panelCamRotAxis, panelCamAngle, myName);
    
    //myPreComp.hideShyLayers = true;
                
} //function panelGenerator

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function lightGenerator(workingComp){
    
     /////////////////////////////////----------------- CREATE LIGHTS ---------------------------------////////////////////////////////
    
     //--------------------------- find lights part of the script -----------------------------------------
    lightsArray = [];
    for(i=1; i<=workingComp.numLayers; i++){  
       //var currentLayer = workingComp.layer(i);
       if(workingComp.layer(i) instanceof LightLayer){
           lightsArray[lightsArray.length]=workingComp.layer(i);   
       } 
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cameraGenerator(compToAdd, thisCamName, panelCamRotAxis, panelCamAngle, panelCamName){

    //add a new camera
    var myCamera = compToAdd.layers.addCamera(thisCamName, [0,0]);
    
    //User Camera parent 
    var theParent = userCam.parent;
   
    //set the path for the  expression linker to work (I think it could be simplify)
     var cameraPath = "comp(\"" + userCompName + "\").layer(\"" + userComp.layer(userCamName).name + "\")";
     //call the function to link properties with expressions
     

    // Link Transform properties  
    
    //alert(userCam.autoOrient);
    myCamera.pointOfInterest = userCam.pointOfInterest;
    myCamera.autoOrient = userCam.autoOrient;

    if (userCam.autoOrient == AutoOrientType.CAMERA_OR_POINT_OF_INTEREST){// camera have a point of interest
        expressionLinker(myCamera, cameraPath);
        //myCamera.pointOfInterest.expression = 'userCompX= comp("'+userCompName+'").width;userCompY= comp("'+userCompName+'").height;thisCompX= comp("'+compToAdd.name+'").width;thisCompY= comp("'+compToAdd.name+'").height;compXpercentage= ((comp("'+userCompName+'").layer("'+userCamName+'").transform.pointOfInterest[0])*100)/userCompX;compYpercentage= ((comp("'+userCompName+'").layer("'+userCamName+'").transform.pointOfInterest[1])*100)/userCompY;thisXvalue= (compXpercentage*thisCompX)/100;thisYvalue= (compYpercentage*thisCompY)/100;[thisXvalue, thisYvalue, comp("'+userCompName+'").layer("'+userCamName+'").transform.pointOfInterest[2]];';
    }else if(userCam.autoOrient  == AutoOrientType.ALONG_PATH){// camera follow a path
        myCamera.autoOrient = AutoOrientType.ALONG_PATH;
        expressionLinker(myCamera, cameraPath);
    }else{// camera auto orient is OFF 
        myCamera.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
        expressionLinker(myCamera, cameraPath);
    }// if (autoOrientTrack)

   
   ///////////////////---------------- Create any PARENT NULL -----------///////////////////
   
   //If the Camera PARENT is NOT NULL do the following
   while (theParent != null){       
        
         //define var counter to count
         var myCounter = 0;
         //define a new array to save the different parent
         var myNull = new Array;
         //define the current layer; the first is the camera of the new comp
         var currentLayer = compToAdd.layer(myCounter+1);
       
        //Take the name of the parent layer
        var parentNullName = theParent.name;
                
        myNull[myCounter] =compToAdd.layers.addNull();
        //Put the same name of the parent to ne new null
        myNull[myCounter].name = "360_"+parentNullName;
        
        currentLayer.parent = myNull[myCounter];
        //currentLayer.setParentWithJump(myNull[myCounter]); 
        
         //Link the properties of the parent to the new null
        myNull[myCounter].anchorPoint.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.anchorPoint';
        myNull[myCounter].position.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.position';
        
        //if the parent is 3d make the new null 3d and link 3d rotation
        if(theParent.threeDLayer){
           myNull[myCounter].threeDLayer = true;
           myNull[myCounter].orientation.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.orientation';
           myNull[myCounter].xRotation.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.xRotation';
           myNull[myCounter].yRotation.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.yRotation';
           myNull[myCounter].zRotation.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.zRotation';
           
        }else{// else link 2d rotation
           myNull[myCounter].rotation.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.rotation';
        }//if(theParent.threeDLayer)
    
        //Link the properties of the parent to the new null
        myNull[myCounter].scale.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.scale';        
        myNull[myCounter].opacity.expression = 'comp("'+userCompName+'").layer("'+parentNullName+'").transform.opacity';
        
         //Locked and shy
        myNull[myCounter].shy = true;
        //myNull[myCounter].locked = true;
   
        //change the layer to see if it is parented and break the while loop
        theParent = theParent.parent;
        
        //add to my counter
        myCounter++;          
   
   }//while (theParent != null)

    ///////////////////---------------- Create de PANEL CAMERA -----------///////////////////
    
    //add a new camera for panel view
    var panelCamera = compToAdd.layers.addCamera("360_"+panelCamName, [0,0]);
    
    panelCamera.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
    
    //Make new camera auto orient OFF
   // panelCamera.autoOrient = (aeVersion+12);   
    
    //set panel camera to be 90 degree field of view
    panelCamera.property("zoom").setValue(panelSize/2);     
    //Rotate the camera according to the panel
    panelCamera.property(panelCamRotAxis).setValue(panelCamAngle);    
    //Parent Panel camera to the user reference camera
    panelCamera.parent = myCamera;
    //set panel camera position to 0
    panelCamera.property("position").setValue([0,0,0]);  
    
   //Locked and shy
   for(var i = 1; i <compToAdd.numLayers; i++){
       compToAdd.layer(i).shy = true;
       compToAdd.layer(i).locked = true;
   }//for(var i = 1; i <compToAdd.numLayers; i++)

 
 

    
}//function cameraGenerator

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function gridHelper(i){  
        
          //Create the back solid
         // var gridBackLayer = panelComps.item(i).layers.addSolid([0, 0, 0], "GRID_"+panelComps.item(i).name+"_BACK", panelSize, panelSize, 1, userComp.duration);
          
          //Create the solid for the Grid FX
          var gridFXLayer = panelComps.item(i).layers.addSolid([0, 1, 0], "GRID_"+panelComps.item(i).name+"_FX", panelSize, panelSize, 1, userComp.duration);
          //add grid effect to the gridFXLayer solid
         var myEffect = gridFXLayer.property("Effects").addProperty("ADBE Grid");
         //Locked and shy
          gridFXLayer.shy = true;
          gridFXLayer.locked = true;
         
          //Create the Text layer
          var gridText = panelComps.item(i).layers.addText("GRID_"+panelComps.item(i).name+"_TXT"); 
          //Create a TextDocument for the style of the sourceText
          var textProp = gridText.property("Source Text");
          var myTextDocument = textProp.value;  
          myTextDocument.text = gridText.containingComp.name;  
          myTextDocument.fontSize = 160;
          myTextDocument.fillColor = [1, 1, 1];
          myTextDocument.font = "Arial";
          myTextDocument.justification = ParagraphJustification.CENTER_JUSTIFY;
          //Set the source text
          gridText.sourceText.setValue(myTextDocument);
          //Set the name of the text layer
          gridText.name = "GRID_"+panelComps.item(i).name+"_TXT";
          gridText.position.expression = '[value[0],(value[1]+60)]';
          
          //Locked and shy
          gridText.shy = true;
          gridText.locked = true;
          
}//function gridHelper()

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function preViz(){
     
     //Create a new comp 
     if(is2k){
        var preVizComp = app.project.items.addComp("360_PRE_VIZ_COMP", 1920, 1080, 1, userComp.duration, userComp.frameRate);
     }else{
        var preVizComp = app.project.items.addComp("360_PRE_VIZ_COMP", 3840, 2160, 1, userComp.duration, userComp.frameRate);
     }
   //var preVizComp = app.project.items.addComp("PRE_VIZ_COMP", panelSize, panelSize, 1, userComp.duration, userComp.frameRate);
    preVizComp.parentFolder = scriptFolder;
    //set the same background color
    preVizComp.bgColor = userComp.bgColor;
    
     //Add panels to the previz comp
     for(i=1; i<=6; i++){
        var tempLayer = preVizComp.layers.add(panelComps.item(i));
        tempLayer.threeDLayer = true;
     }//for(add  panels)
 
     //Position the panels in 3d space
     for(i=1; i<=6; i++){
        switch(preVizComp.layer(i).name) {
    case "FRONT":
        preVizComp.layer(i).position.setValue([(panelSize/2),(panelSize/2),(panelSize/2)]);
        break;
    case "BACK":
        preVizComp.layer(i).position.setValue([(panelSize/2),(panelSize/2),-(panelSize/2)]);
        preVizComp.layer(i).orientation.setValue([0,180,0]);        
        break;
     case "TOP":
        preVizComp.layer(i).position.setValue([(panelSize/2),0,0]);
        preVizComp.layer(i).orientation.setValue([270,180,180]); 
        break;
    case "BOTTOM":
        preVizComp.layer(i).position.setValue([(panelSize/2),panelSize,0]);
        preVizComp.layer(i).orientation.setValue([270,0,0]); 
        break;
     case "LEFT":
        preVizComp.layer(i).position.setValue([0,(panelSize/2),0]);
        preVizComp.layer(i).orientation.setValue([0,270,0]); 
        break;
    case "RIGHT":
        preVizComp.layer(i).position.setValue([panelSize,(panelSize/2),0]);
        preVizComp.layer(i).orientation.setValue([0,90,0]); 
        break;   
    default:
        //default code block
        }//switch(preVizComp.layer(i).name)  
     }// for(position layer)
 
    //add the Pre Viz camera
    var preVizCamera = preVizComp.layers.addCamera("PRE_VIZ_CAMERA", [0,0]);
    preVizCamera.position.setValue([(panelSize/2),(panelSize/2),0]);
    preVizCamera.pointOfInterest.setValue([(panelSize/2),(panelSize/2),0]);
    
    if(is2k){
        preVizCamera.cameraOption.zoom.setValue(785);
     }else{
        preVizCamera.cameraOption.zoom.setValue(1600); 
     }  
  
      preVizCamera.cameraOption.focusDistance.setValue(2666.7);
      preVizCamera.cameraOption.aperture.setValue(17.7); 
   
   //open preVizComp
   preVizComp.openInViewer();
   
    //Locked and shy
   for(var i = 1; i <=preVizComp.numLayers; i++){
       preVizComp.layer(i).shy = true;
       preVizComp.layer(i).locked = true;
   }//for(var i = 1; i <compToAdd.numLayers; i++)

    //preVizComp.hideShyLayers = true;
   
   preVizComp.label = 13;
 
}//function preViz()

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function regenerator(myString, myCommand){

    //--------------------------- find and delete part of the script -----------------------------------------
    var compsArray = new Array();
    var foundOne = false;
    var matchesObject = new Object();
    
    for(i=1; i<=panelComps.numItems; i++){
        compsArray[compsArray.length]=panelComps.item(i);
    }

   if (compsArray.length == 0){//check to make sure we have comps
            alert("No Comp Panels where found");
            return;
    }//if (myCompsArray.length == 0)

    

    for(var i = 0; i<compsArray.length; i++){
         var matchingLayersArray = new Array();   
         var myComps = compsArray[i];
         for(var j=1; j<myComps.numLayers; j++){
             var myLayer = myComps.layer(j);
             if(myLayer.name.match(myString)){
                 foundOne = true;
                 matchingLayersArray[matchingLayersArray.length] = myLayer;
            }
        }
    
        if(matchingLayersArray.length != 0){//we have at least one matching layer
                matchesObject[myComps.id] ={
                    compName: myComps.name,
                    compId: myComps.id,
                    matchingLayers: matchingLayersArray                
                }   
        }//if(matchingLayersArray.length != 0)
    }

    if(!foundOne){
            alert("No layer found!");
            return;
     }

    for (var i in matchesObject){
        var myPreComp = matchesObject[i];
        for(var j=0; j<myPreComp.matchingLayers.length; j++){
                myPreComp.matchingLayers[j].locked = false;
                myPreComp.matchingLayers[j].remove();
            }
     }   

    //------------------------------   Regenerate part of the scrip -----------------------------


    for(var i = 0; i<compsArray.length; i++){
        theCompName = compsArray[i].name;
        //alert(compsArray[i].name);
        switch(theCompName) {
                        case "FRONT":          
                            cameraGenerator(compsArray[i], "360_userCamRef", "xRotation", 0, "FRONT");
                            break;
                        case "BACK":
                            cameraGenerator(compsArray[i], "360_userCamRef", "yRotation", 180, "BACK");    
                            break;
                         case "TOP":
                            cameraGenerator(compsArray[i], "360_userCamRef", "xRotation", 90, "TOP");
                            break;
                        case "BOTTOM":
                            cameraGenerator(compsArray[i], "360_userCamRef", "xRotation", -90, "BOTTOM");
                            break;
                         case "LEFT":
                            cameraGenerator(compsArray[i], "360_userCamRef", "yRotation", -90, "LEFT");
                            break;
                        case "RIGHT":
                            cameraGenerator(compsArray[i], "360_userCamRef", "yRotation", 90, "RIGHT");
                            break;   
                        default:
                            //default code block
                }//switch(theCompName)
    }//for(var i = 0; i<compsArray.length; i++)
   
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function visualGrid(myString, myCommand){

    //--------------------------- find and delete part of the script -----------------------------------------
    var compsArray = new Array();
    var foundOne = false;
    var matchesObject = new Object();
    
    for(i=1; i<=panelComps.numItems; i++){
        compsArray[compsArray.length]=panelComps.item(i);
    }

   if (compsArray.length == 0){//check to make sure we have comps
            alert("No Comp Panels where found");
            return;
    }//if (myCompsArray.length == 0)

    

    for(var i = 0; i<compsArray.length; i++){
         var matchingLayersArray = new Array();   
         var myComps = compsArray[i];
         for(var j=1; j<myComps.numLayers; j++){
             var myLayer = myComps.layer(j);
             if(myLayer.name.match(myString)){
                 foundOne = true;
                 matchingLayersArray[matchingLayersArray.length] = myLayer;
            }
        }//for(var j=1; j<myComps.numLayers; j++){
    
        if(matchingLayersArray.length != 0){//we have at least one matching layer
                matchesObject[myComps.id] ={
                    compName: myComps.name,
                    compId: myComps.id,
                    matchingLayers: matchingLayersArray                
                }   
        }//if(matchingLayersArray.length != 0)
    }//for(var i = 0; i<compsArray.length; i++){

    if(!foundOne){
            alert("No grid layer found!");
            return;
     }

     //------------------------------   Hide/show part of the scrip -----------------------------


    if(isGrid){         
          for (var i in matchesObject){
              var myPreComp = matchesObject[i];
              for(var j=0; j<myPreComp.matchingLayers.length; j++){
                  //alert("name "+myPreComp.matchingLayers[j].name);
                  myPreComp.matchingLayers[j].enabled = false;
               }// for(var j=0; j<myPreComp.matchingLayers.length; j++)
           }//for (var i in matchesObject)
            isGrid = false;
     }else{//if(isGrid)
          for (var i in matchesObject){
              var myPreComp = matchesObject[i];
              for(var j=0; j<myPreComp.matchingLayers.length; j++){
                  //alert("name "+myPreComp.matchingLayers[j].name);
                  myPreComp.matchingLayers[j].enabled = true;
               }// for(var j=0; j<myPreComp.matchingLayers.length; j++)
           }//for (var i in matchesObject)
            isGrid = true;
     }// ! isGrid   
   
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function equirectangular(){
       
    //Create a new comp 
     if(is2k){
        var equiComp = app.project.items.addComp("360_RENDER", 1920, 1080, 1, userComp.duration, userComp.frameRate);
        preCompSize = Math.round(Math.sqrt((panel2k*panel2k )+(panel2k*panel2k)));
     }else{
        var equiComp = app.project.items.addComp("360_RENDER", 3840, 2160, 1, userComp.duration, userComp.frameRate);
        preCompSize = Math.round(Math.sqrt((panel4k*panel4k )+(panel4k*panel4k)));
     }
    equiComp.parentFolder = scriptFolder;
    //set the same background color
    equiComp.bgColor = userComp.bgColor;

     //Add panels to the render comp
     for(i=1; i<=6; i++){
        var tempLayer = equiComp.layers.add(panelComps.item(i));
     }//for(add  panels)

    var theWidth = equiComp.width;
    var theHeight = equiComp.height;
    
    var preCompYpos = (preCompSize*0.34)/2;
    tileMove = (preCompSize/2)-(preCompSize/8);
    
    var preScale = equiComp.width/4;
    var currentProportion = (panelSize*100)/preScale;
    var scaleFactor = (100*100)/currentProportion;
    //alert(scaleFactor);
    
    
    //Position the panels 
     for(i=1; i<=6; i++){
        switch(equiComp.layer(i).name) {
    case "FRONT":
        //equiComp.layer(i).position.setValue([(theWidth/2),(theHeight/2)]);
        //equiComp.layer(i).scale.setValue([scaleFactor,scaleFactor]);
        //add FX
        sidesDistort(equiComp.layer(i));
        
        equiComp.layer(i).scale.setValue([scaleFactor,scaleFactor]);
        equiComp.layer(i).position.setValue([(theWidth/2),(theHeight/2)]);
        break;
    case "BACK":
        equiComp.layer(i).position.setValue([0,(theHeight/2)]);    
        equiComp.layer(i).scale.setValue([scaleFactor,scaleFactor]);
        //add FX
        sidesDistort(equiComp.layer(i));
        //duplicate
        var backCopy = equiComp.layer(i).duplicate();
        backCopy.position.setValue([theWidth,(theHeight/2)]); 
        break;
     case "TOP":
        //Rotate and scale original layer
        equiComp.layer(i).scale.setValue([100,-100]);
        equiComp.layer(i).rotation.setValue(135);
        //pre compose the layer
        var theIndex = equiComp.layer(i).index; 
        var topPreComp = equiComp.layers.precompose([theIndex], "TOP_PreComp");
        //change the pre compose size
        topPreComp.width = preCompSize;
        topPreComp.height = preCompSize;
        //position the layer to the center
        topPreComp.layer(1).position.setValue([(preCompSize/2),(preCompSize/2)]);
        //put the pre compose in the helpers folder
        topPreComp.parentFolder = helperComps;
        //calculate andset the value for the scale of the precomp
        var preCompWidth = (theWidth*100)/preCompSize;
        if(is2k){//*** 60 para 4k ????  ---- 34 par 2k
            equiComp.layer(i).scale.setValue([preCompWidth,34]);
            //position the pre compose in the equirectangulas comp
            equiComp.layer(i).position.setValue([(theWidth/2),preCompYpos]);
        }else{
            equiComp.layer(i).scale.setValue([preCompWidth,60]);     
            equiComp.layer(i).position.setValue([(theWidth/2),((preCompSize*0.60)/2)]);
        }
        
       //add FX
        topBottomDistort(equiComp.layer(i)); 
        break;
    case "BOTTOM":
        //Rotate and scale original layer
        equiComp.layer(i).scale.setValue([100,-100]);
        ///////////////////--------------ROTATION CHANGE-------
        equiComp.layer(i).rotation.setValue(-45);
        //---------------------------------//////////////////////////////
        //pre compose the layer
        var theIndex = equiComp.layer(i).index; 
        /////////////////----------NAME CHANGE-----------
        var topPreComp = equiComp.layers.precompose([theIndex], "BOTTOM_PreComp");
        //---------------------------------//////////////////////////////
        //change the pre compose size
        topPreComp.width = preCompSize;
        topPreComp.height = preCompSize;
        //position the layer to the center of the preComp
        topPreComp.layer(1).position.setValue([(preCompSize/2),(preCompSize/2)]);
        //put the pre compose in the helpers folder
        topPreComp.parentFolder = helperComps;
        //calculate and set the value for the scale of the precomp
        var preCompWidth = (theWidth*100)/preCompSize;
        
        ///////////////////-----------------ROTATION ADDED AND Y POSITION CHANGE-----------        
        if(is2k){//*** 60 para 4k ????  ---- 34 par 2k
            equiComp.layer(i).scale.setValue([preCompWidth,34]);
            equiComp.layer(i).rotation.setValue(180);
            //position the pre compose in the equirectangulas comp
            equiComp.layer(i).position.setValue([(theWidth/2),(theHeight-preCompYpos)]);
        }else{
            equiComp.layer(i).scale.setValue([preCompWidth,60]);     
            equiComp.layer(i).rotation.setValue(180);
            equiComp.layer(i).position.setValue([(theWidth/2),(theHeight-(preCompSize*0.60)/2)]);
        }

        topBottomDistort(equiComp.layer(i));            
        break;
     case "LEFT":
        equiComp.layer(i).position.setValue([preScale,(theHeight/2)]);
        equiComp.layer(i).scale.setValue([scaleFactor,scaleFactor]);
        //add FX
        sidesDistort(equiComp.layer(i));
        break;
    case "RIGHT":
        equiComp.layer(i).position.setValue([(preScale*3),(theHeight/2)]);
        equiComp.layer(i).scale.setValue([scaleFactor,scaleFactor]);
        //add FX
        sidesDistort(equiComp.layer(i));
        break;   
    default:
        //default code block
        }//switch(preVizComp.layer(i).name)  
     }// for(position layer)
 
    //Open and focus on RENDER COMP
     equiComp.openInViewer();
     
     //Locked and shy
   for(var i = 1; i <=equiComp.numLayers; i++){
       equiComp.layer(i).shy = true;
       equiComp.layer(i).locked = true;
   }//for(var i = 1; i <compToAdd.numLayers; i++)

    //equiComp.hideShyLayers = true;
    
    equiComp.label = 9;

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function topBottomDistort(currentPreComp){
 
        var myPolar = currentPreComp.property("Effects").addProperty("ADBE Polar Coordinates");
        myPolar.property("ADBE Polar Coordinates-0001").setValue(1);
        
        var myTile = currentPreComp.property("Effects").addProperty("ADBE Tile");
        myTile.property("ADBE Tile-0001").setValue([tileMove, preCompSize/2]);
        
        var myWarp = currentPreComp.property("Effects").addProperty("ADBE BEZMESH");
        //Right Top Tangent 1.5068
        myWarp.property("ADBE BEZMESH-0005").expression = '[value[0],(value[1]*1.5)]';
        //Right Bottom Tangent 1.1527
        myWarp.property("ADBE BEZMESH-0006").expression = '[value[0],(value[1]*1.15)]'; 
        //Bottom Right vertex 0.8263
        myWarp.property("ADBE BEZMESH-0007").expression = '[value[0],(value[1]*0.8)]'; 
        //Bottom Right tangent 0.8115
        myWarp.property("ADBE BEZMESH-0008").expression = '[value[0],(value[1]*0.8)]'; 
        //Bottom left tangent
        myWarp.property("ADBE BEZMESH-0009").expression = '[value[0],(value[1]*0.8)]';  
        //Left Bottom vertex
        myWarp.property("ADBE BEZMESH-0010").expression = '[value[0],(value[1]*0.8)]'; 
        //Left Bottom Tangent
        myWarp.property("ADBE BEZMESH-0011").expression = '[value[0],(value[1]*1.15)]'; 
        //Left Top Tangent
        myWarp.property("ADBE BEZMESH-0012").expression = '[value[0],(value[1]*1.5)]'; 
            
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sidesDistort(currentPreComp){
    
    var spread;
    var corners;
    var myTangentsX;
    var myTangentsY;
    
    if(is2k){ // FOR 2K
        
        spread = 0.2251;
        corners = 0.0584;
        myTangentsX = 0.2814;
        myTangentsY = 0.1169;
        
    }else{ // FOR 4K
        
        spread = 0.2065;       
        corners = 0.0521;
        myTangentsX = 0.2987;
        myTangentsY = 0.119;
        
    }

    //--------------------------------------------------
    
    var myWarp_one = currentPreComp.property("Effects").addProperty("ADBE BEZMESH");
    
    //Top Left Tangent  was 0.51
    myWarp_one.property("ADBE BEZMESH-0002").expression = '[(this.width*'+spread+'),value[1]]';
    //myWarp_one.property("ADBE BEZMESH-0002").expression = '[(this.width*'+spread+'),value[1]]';
    //Top Right Tangent 
    myWarp_one.property("ADBE BEZMESH-0003").expression = '[(this.width-(this.width*'+spread+')),value[1]]';
    //Bottom Right Tangent  was 1.25
    myWarp_one.property("ADBE BEZMESH-0008").expression = '[(this.width-(this.width*'+spread+')),value[1]]';
    //Bottom Left Tangent   --- ONLY DIFFERENT ... was: [(value[0]*0.6437),value[1]]
    myWarp_one.property("ADBE BEZMESH-0009").expression = '[(this.width*'+spread+'),value[1]]';
    
    //------------------------------------------------------
    
    var myWarp_two = currentPreComp.property("Effects").addProperty("ADBE BEZMESH");
    
    //Top Left Vertex  19.9630 was [value[0],(thisComp.height/20)]
    myWarp_two.property("ADBE BEZMESH-0001").expression = '[value[0],(this.height*'+corners+')]';
    //Top Left Tangent  9.3913 was [(value[0]*0.86875),(value[1]-(thisComp.height/9.4))]
    myWarp_two.property("ADBE BEZMESH-0002").expression = '[(this.width*'+myTangentsX+'),(-this.height*'+myTangentsY+')]';
    //Top Right Tangent  9.3913   was [(value[0]*1.0593),(value[1]-(thisComp.height/9.4))]
    myWarp_two.property("ADBE BEZMESH-0003").expression = '[(this.width-(this.width*'+myTangentsX+')),(-this.height*'+myTangentsY+')]';
    //Right Top Vertex  19.9630
    myWarp_two.property("ADBE BEZMESH-0004").expression = '[value[0],(this.height*'+corners+')]';
    //Bottom Right Vertex 18.9 was [value[0],(value[1]-(thisComp.height/20))]
    myWarp_two.property("ADBE BEZMESH-0007").expression = '[value[0],(value[1]-(this.height*'+corners+'))]';
    //Bottom Right Tangent  [(value[0]*1.0593),(value[1]-(thisComp.height/9.4))]
    myWarp_two.property("ADBE BEZMESH-0008").expression = '[(this.width-(this.width*'+myTangentsX+')),(this.height+(this.height*'+myTangentsY+'))]';
    //Bottom Left Tangent  [(value[0]*0.86875),(value[1]+(thisComp.height/9.4))]
    myWarp_two.property("ADBE BEZMESH-0009").expression = '[(this.width*'+myTangentsX+'),(this.height+(this.height*'+myTangentsY+'))]';
    //Left Bottom Vertex
    myWarp_two.property("ADBE BEZMESH-0010").expression = '[value[0],(value[1]-(this.height*'+corners+'))]';

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////

function toPanelSize(palObj){    
    
    //Begin Undo
    app.beginUndoGroup("Convert to Panel Size");
    
    if(app.project.activeItem.selectedLayers[0] != undefined){
        
        if(confirm("All instance of this layer will be modified. Do you want to continue?", false)){
            for(var i = 0; i < app.project.activeItem.selectedLayers.length; i++){
                app.project.activeItem.selectedLayers[i].source.width = panelSize;
                app.project.activeItem.selectedLayers[i].source.height = panelSize;
            }
        }else{
           return;
        }
  
    }else{
            alert("Please select at least one layer");
            return;
     }
    
      app.endUndoGroup();
 
}
//////////////////////////////////////////////////////////////////////////////////////////////////////

function propagate(palObj){    
    
    //Begin Undo
    app.beginUndoGroup("Propagation");
    // if a layer is selected
    if(app.project.activeItem.selectedLayers[0] != undefined){
        
        //Number of selected layers
        var selectedNum = app.project.activeItem.selectedLayers.length;
        
    ////////-------------FOR EACH SELECTED LAYER TO PROPAGATE            

        for(var i = 0; i < selectedNum; i++){
            
            //put the selected layer on this variable
            var layerToCopy = app.project.activeItem.selectedLayers[i];
            var layerToCopyIndex = layerToCopy.index;
            
           //-------FIRST CHECK FOR DUPLICATES ----------------------
           
           //boolean var at first there is no duplicates
           var duplicatesFound = false;        
           //for each cube panel comp do the following
           for(var j=1; j<=panelComps.numItems; j++){
               //Select the cube panel to look for duplicates
               var currentPanel = panelComps.item(j);              
               //Work with each layer of the selected layer in the selected cube panel comp                                
               for(var m=1; m<=currentPanel.numLayers; m++){
                   //store the name of the current layer to check if is the same as the layer to copy
                   var duplicateLayer = currentPanel.layer(m).name;
                   //If the layer to copy has the same name of the checking layer...
                   if(duplicateLayer == layerToCopy.name){
                       //found duplicates is true
                       duplicatesFound = true;
                   }
               }
            }
        
           //-------AFTER CHEKING FOR DUPLICATES ----------------      
           //------------DUPLICATE TO PROPAGATE----------------------     
            
            // If a duplicate was found
            if(duplicatesFound){
                //Confirm if you want ro replace the existing  duplicated layer
                if(confirm("Duplicates found. Do you want to continue?", true)){
                    // If yes, call the function to propagate
                    copyToPropagate(layerToCopy, layerToCopyIndex);   
                 // If you don't want to replace the existing duplicated layer  
                 }else{
                     //exit
                     return;
                 }
            // If  no duplicates were found
            }else{
                 // call the function to propagate
                copyToPropagate(layerToCopy, layerToCopyIndex);          
            }           
        }//for(var i = 0; i < app.project.activeItem.selectedLayers.length; i++){
         
    
         //STACK LAYER ORDER
         for(var h=1; h<=panelComps.numItems; h++){
                    var currentPanel = panelComps.item(h);
                    for(var k=1; k<=selectedNum; k++){
                        //currentPanel.layer(1).locked = true;  
                        currentPanel.layer(1).moveToEnd();         
                    }
          }
      
          // LOCK LAYERS      
      
          for(var y=1; y<=panelComps.numItems; y++){
                    var thePanel = panelComps.item(y);
                    var totalLayers = thePanel.numLayers;
                    var indexStart = totalLayers - selectedNum;
                    for(var z=indexStart; z<=totalLayers; z++){
                        thePanel.layer(z).locked = true;          
                    }
          }
      
         // FINISH
         alert("Propagation done");
    
    // IF NO LAYER IS SELECTED
    }else{//if(app.project.activeItem.selectedLayers[0] != undefined){
            alert("Please select at least one layer");
            return;
     }
    
      app.endUndoGroup();
      
}
//////////////////////////////////////////////////////////////////////////////////////////////////////

function copyToPropagate(layerToCopy, layerToCopyIndex){
    
    // for each cube panel comp do the following
    for(var j=1; j<=panelComps.numItems; j++){
        //Select the cube panel to copy la layer
        var currentPanel = panelComps.item(j);     
        //copy the layer to the selected comp panel
        layerToCopy.copyToComp(currentPanel);    
        // the copied layer goes to the top layer, so we copied to a variable
        var newCopiedLayer =  currentPanel.layer(1);
        //set the path for the  expression linker to work (I think it could be simplify)
        var layerPath = "comp(\"" + userCompName + "\").layer(\"" + currentPanel.layer(layerToCopy.name).name + "\")";
        //call the function to link properties with expressions
        expressionLinker(newCopiedLayer, layerPath);     
        //reset
        currentPanel = "";
        newCopiedLayer = "";
        layerPath = "";         
     }
      //after coping the layer, covert the origianl to a guide layer
      layerToCopy.guideLayer = true;  
                 
}


///////////////////////////////////////////////////////////////////////////////////////////////////////


function expressionLinker(newCopiedLayer, originalLayerPath){ 
    if (newCopiedLayer != null){      
               
		for (var i = 1; i <= newCopiedLayer.numProperties; ++i){
            
			var property = newCopiedLayer.property(i);
                       
			if (property.propertyType == PropertyType.PROPERTY && property.canSetExpression){
				try{
					if (property.enabled){
						property.expression = originalLayerPath + "(\"" + property.matchName + "\")";
						property.expressionEnabled = true;
					}
				} catch (e) {}
			}else if ((property.propertyType == PropertyType.INDEXED_GROUP) || (property.propertyType == PropertyType.NAMED_GROUP)){
				expressionLinker(property, originalLayerPath + "(\"" + property.name + "\")");
             }
		}
	}
     
     

}

////////////////////////////////////////////////////////////////////////////////////////////////////

function theDuplicator(){

    app.beginUndoGroup("Duplicator");

    if(app.project.activeItem.selectedLayers[0] != undefined){
           
          if(app.project.activeItem.selectedLayers.length == 1){
              
               if(app.project.activeItem.selectedLayers[0].threeDLayer){
                   
                    var myPrompt = prompt("Number of copies", "0", "Duplicator");                    
                    numCopies = Number(myPrompt);
                                        
                    if(isNaN(numCopies)){
                        alert("Please insert a number");
                        return;  
                    }else{
                        //user layer
                        userDuplicateLayer = app.project.activeItem.selectedLayers[0];
                        userDuplicateLayerName = userDuplicateLayer.name;  
                       
                       //user comp
                        userDuplicateLayerComp = app.project.activeItem;
                        userDuplicateLayerCompName = userDuplicateLayerComp.name;
                    }
                }else{
                  alert("Must be a 3D Layer");
                  return;  
                }   
          
          } else{
            alert("Please select a single layer");
            return;
          }
           
       }else{
            alert("Please select a layer");
            return;
       }
   
   // Create CONTROL Layer
    var controlLayer = userDuplicateLayerComp.layers.addNull();
    controlLayer.name = "CONTROL_of_"+userDuplicateLayerName
    
    // Add effects to Control layer
    var myCenter = controlLayer.property("Effects").addProperty("ADBE Layer Control");
    myCenter.name = "CENTER";
    myCenter.property("ADBE Layer Control-0001").setValue(0);  
    
    var myLookAt = controlLayer.property("Effects").addProperty("ADBE Checkbox Control");
    myLookAt.name = "Look At Center";
    
    var distanceFromCenter = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    distanceFromCenter.name = "Distance From Center";
    
    var distanceRandom = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    distanceRandom.name = "Distance Randomness";
    
    var angleControl = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    angleControl.name = "Angle Control";
    
    var angleRandom = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    angleRandom.name = "Angle Randomness";
    
    var distanceFromCenter = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    distanceFromCenter.name = "Random Seed";
    
    var duplicateScaleX = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    duplicateScaleX.name = "Scale X";
    
    var duplicateScaleXrandom = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    duplicateScaleXrandom.name = "Scale X Randomness";
    
    var duplicateScaleY = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    duplicateScaleY.name = "Scale Y";
    
    var duplicateScaleYrandom = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    duplicateScaleYrandom.name = "Scale Y Randomness";
    
    var duplicateRotationX = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    duplicateRotationX.name = "Rotation X";
    
    var angleRandom = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    angleRandom.name = "Rotation X Randomness";
    
    var duplicateRotationY = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    duplicateRotationY.name = "Rotation Y";
    
    var angleRandom = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    angleRandom.name = "Rotation Y Randomness";
    
    var duplicateRotationZ = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    duplicateRotationZ.name = "Rotation Z";
    
    var angleRandom = controlLayer.property("Effects").addProperty("ADBE Angle Control");
    angleRandom.name = "Rotation Z Randomness";
    
    var duplicateOpacity = controlLayer.property("Effects").addProperty("ADBE Slider Control"); 
    duplicateOpacity.name = "Opacity";
    duplicateOpacity.property("ADBE Slider Control-0001").setValue(100); 
    
    var duplicateOpacityrandom = controlLayer.property("Effects").addProperty("ADBE Slider Control");
    duplicateOpacityrandom.name = "Opacity Randomness";
    
    // Pre Compose Layer
    var duplicatorPreComp = userDuplicateLayerComp.layers.precompose([userDuplicateLayer.index], userDuplicateLayerName);
    
    var thePreComp = userDuplicateLayerComp.layer(userDuplicateLayerName);
    thePreComp.threeDLayer = true;
    thePreComp.collapseTransformation = true;
    
     //-----------  AQUI MOVER LA PRE COMP A UNA CARPETA!!  --------------------------------
    duplicatorPreComp.parentFolder = helperComps;
   
    
    // Put expressions on properties of the layer
    var newDuplicateLayer = duplicatorPreComp.layer(1);
    
    newDuplicateLayer.position.expression = "userRandomValue = degreesToRadians(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Angle Randomness')('Angle'));seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);userDist = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Distance From Center')('Slider');userRandomDist = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Distance Randomness')('Slider');userAngle = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Angle Control')('Angle');x=this.position[0];y=this.position[1];z=this.position[2];oX=thisComp.width/2;oZ=0;subX = x-oX;subZ = z-oZ;try{control = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('CENTER')('Layer');centerX =  control.transform.position[0].valueAtTime(0);centerZ =  control.transform.position[2].valueAtTime(0);controlSubX = x - centerX;controlSubZ = z - centerZ;realDist = Math.sqrt(Math.pow(controlSubX, 2)+Math.pow(controlSubZ, 2))+userDist;}catch(err){realDist = Math.sqrt(Math.pow(subX, 2)+Math.pow(subZ, 2))+userDist;}if(userRandomDist > 0){myRandomDistMax = realDist+userRandomDist;myRandomDistMin = realDist-userRandomDist;randomDist = random(myRandomDistMin, myRandomDistMax);r=randomDist;}else{r=realDist;}randomPos = random(userRandomValue);theta=Math.atan2(subZ, subX)+degreesToRadians((userAngle*-index))+randomPos;x= r*Math.cos(theta);z= r*Math.sin(theta);try{control = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('CENTER')('Layer');center =  control.transform.position;[center[0]+x, center[1], center[2]+z];}catch(err){center = [oX,0,0];center + [x, y,  z];}";
    newDuplicateLayer.scale.expression = "userX = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Scale X')('Slider');userY = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Scale Y')('Slider');userXrandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Scale X Randomness')('Slider');XrandomMax = userX+userXrandom;XrandomMin = userX-userXrandom;userYrandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Scale Y Randomness')('Slider');YrandomMax = userY+userYrandom;YrandomMin = userY-userYrandom;seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);randomX = random(XrandomMin, XrandomMax);randomY = random(YrandomMin, YrandomMax);if(userXrandom > 0){xValue = randomX;}else{xValue = userX;}if(userYrandom > 0){yValue = randomY;}else{yValue = userY;}[value[0]+xValue, value[1]+yValue, value[2]];";
    newDuplicateLayer.orientation.expression = "if(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Look At Center')('Checkbox') == 1){try{lookAt(position,comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('CENTER')('Layer').position);}catch(err){oX = thisComp.width/2;oY = thisComp.height/2;center = [oX,oY,0];lookAt(position, center);}}else{value}";
    newDuplicateLayer.xRotation.expression = "userRot = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation X')('Angle');userRotRandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation X Randomness')('Angle');randomMax = userRot+userRotRandom;randomMin = userRot-userRotRandom;seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);randomRot = random(randomMin, randomMax);if(userRotRandom > 0){rotValue = randomRot;}else{rotValue = userRot;}rotValue;";
    newDuplicateLayer.yRotation.expression = "userRot = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation Y')('Angle');userRotRandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation Y Randomness')('Angle');randomMax = userRot+userRotRandom;randomMin = userRot-userRotRandom;seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);randomRot = random(randomMin, randomMax);if(userRotRandom > 0){rotValue = randomRot;}else{rotValue = userRot;}rotValue;";
    newDuplicateLayer.zRotation.expression = "userRot = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation Z')('Angle');userRotRandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Rotation Z Randomness')('Angle');randomMax = userRot+userRotRandom;randomMin = userRot-userRotRandom;seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);randomRot = random(randomMin, randomMax);if(userRotRandom > 0){rotValue = randomRot;}else{rotValue = userRot;}rotValue;";
    newDuplicateLayer.opacity.expression = "userOpa = comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Opacity')('Slider');userOpaRandom=  comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Opacity Randomness')('Slider');randomMax = userOpa + userOpaRandom;randomMin = userOpa - userOpaRandom;seedRandom(comp('"+userDuplicateLayerCompName+"').layer('"+controlLayer.name+"').effect('Random Seed')('Slider'), true);randomOpa = random(randomMin, randomMax);if(userOpaRandom > 0){opaValue = randomOpa;}else{opaValue = userOpa;}opaValue;";
    
    for(var i=1; i< numCopies; i++){
        newDuplicateLayer.duplicate();
    }
    
    alert(numCopies+" copies created");
    
    
    app.endUndoGroup();

}