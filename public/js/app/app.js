var app = angular.module("dragDropApp", []);


app.filter("getPercentage", function  ($filter) {
        return function (percentage) {
            return percentage +' %'
            }
        });

app.controller("dragDropCtrl", function ($scope, $http) {
    $scope.loading=false;
    $scope.iNoOfFilespending=0;
    $scope.data = {
        name: "No name",
        lastModifiedDate: "No date",
        src: "No data",
        chat: {}, 
        user: {}
    };
    
    $scope.median = function (values) {


        values.sort(function (a, b) { return a - b; });

        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];
        else
            return (values[half - 1] + values[half]) / 2.0;
    }
    
    $scope.findPersonalityMatch = function () {
        console.log('to be done');
    }

    $scope.analyzePersonality = function (sUserId) {
        $scope.loading=true;
        $http({
            method: 'POST',
            url: 'api/profile',
            headers: {
                'Content-Type': "application/json; charset=UTF-8"
            },
            data: {
                contentItems: [
                    {
                        "content": $scope.data.user[sUserId].authoredText,
                        "id": "string",
                        "created": 0,
                        "updated": 0,
                        "contenttype": "text/plain",
                        "language": "ar",
                        "parentid": "null",
                        "reply": false,
                        "forward": false
                    }
                ]

            }
        }).then(function successCallback(response) {
            if (response.data.warnings[0])
                $scope.data.user[sUserId].status=response.data.warnings[0].message;
            else 
                $scope.data.user[sUserId].status = "All good, analyzed"
            $scope.data.user[sUserId].personality = $scope.getPersonalityTraits(response.data);
            $scope.data.isAtLeastOneUserAnalyzed = true;
            $scope.loading=false;
        }, function errorCallback(response) {
            $scope.data.user[sUserId].status = response.data.error
            console.log(response);
            $scope.loading=false;
        });

    }
     

    $scope.getPersonalityMatch = function (oUser1Id, oUser2Id) {
        //console.log(oUser1Id+' versus '+oUser2Id);
        if (Array.isArray($scope.data.user[oUser1Id].personality) && Array.isArray($scope.data.user[oUser2Id].personality)) {
            var oUser1 = $scope.data.user[oUser1Id];
            var oUser2 = $scope.data.user[oUser2Id];
            //var sResult = 'N/A';
            var arriDif=[];
            if (oUser1.username == oUser2.username)
                return {text:"Same",percentage:100};   
            else {
                var sResult = "";
                var sDif = "";
                var iResultDif = 0;

                for (i = 0; i < oUser1.personality.length; i++) {
                    if (oUser1.personality[i].percentage>=60 || oUser2.personality[i].percentage>=60) {
                        iDif = Math.abs(oUser1.personality[i].percentage - oUser2.personality[i].percentage)
                        arriDif.push(iDif);
                        iResultDif += iDif;
                        }
                }

            }
            console.log(arriDif);
            
            var iResultDifPercentage = $scope.median(arriDif);

            console.log(iResultDifPercentage);

            if (iResultDifPercentage <= 1) sDif = "Match!"
            else if (iResultDifPercentage <= 4) sDif = "Can be friends"
            else if (iResultDifPercentage <= 6) sDif = "Different"
            else sDif='Incompatible'
            
            jResult={text:sDif,percentage:100-iResultDifPercentage}
            console.log(JSON.stringify(jResult));
            return jResult;   
         }
         else {
            return {text:"N/A",percentage:0};   
            }
     }
        
    /*
    $scope.logPersonalityTraits = function () {
        console.log(JSON.stringify ($scope.getPersonalityTraits({ "tree": { "children": [ { "children": [ { "children": [ { "children": [ { "category": "personality", "percentage": "0.5" },{ "category": "personality", "percentage": "0.8" } ] } ] } ] } ] } })));
    }
*/
    $scope.getPersonalityTraits = function (obj) {
        var oResult=[];    
        for (var children0 in obj.tree) {
                //console.log(JSON.stringify(obj.tree[children0]));
                for (var children1 in obj.tree[children0]) {
                    //console.log(JSON.stringify(obj.tree[children0][children1]));
                    for (var children2 in obj.tree[children0][children1]) {
                        //console.log(JSON.stringify(obj.tree[children0][children1][children2]));
                            for (var children3 in obj.tree[children0][children1][children2]) {
                            //console.log(JSON.stringify(obj.tree[children0][children1][children2][children3]));
                                for (var children4 in obj.tree[children0][children1][children2][children3]) {
                                    //console.log(JSON.stringify(obj.tree[children0][children1][children2][children3][children4]));
                                    for (var children5 in obj.tree[children0][children1][children2][children3][children4]) {
                                        //console.log(JSON.stringify(obj.tree[children0][children1][children2][children3][children4][children5]));
                                        for (var children6 in obj.tree[children0][children1][children2][children3][children4][children5]) {
                                            //console.log(JSON.stringify(obj.tree[children0][children1][children2][children3][children4][children5][children6]));
                                            for (var children7 in obj.tree[children0][children1][children2][children3][children4][children5][children6]) {
                                                //console.log(JSON.stringify(obj.tree[children0][children1][children2][children3][children4][children5][children6][children7]));
                                                var oTrait=obj.tree[children0][children1][children2][children3][children4][children5][children6][children7]
                                                if (oTrait.percentage && oTrait.category!='behavior') {
                                                    oTrait.percentage=Math.round(oTrait.percentage*100) //convert to percent
                                                    oResult.push(oTrait)
                                                    }
                                                }
                                            }
                                        }
                                    }
                             }
                        }
                    }
                }
        return (oResult);
    }
});

 

app.directive('dragDropCanvas', function () {

    return {
        restrict: 'E',
        replace: true,
        template: '<canvas/>',
        controller: 'dragDropCtrl',
        scope: false,
        link: function ($scope, element) {
            /**
             * Bind canvas to dragover event
             */
            element.bind('dragover', function (event) {
                event.stopPropagation();
                event.preventDefault();

                //Set the drop effect for the draggable image
                event.dataTransfer.dropEffect = 'copy';
            });

            /**
             * Bind canvas to dragenter event
             */
            element.bind('dragenter', function (event) {
                event.stopPropagation();
                event.preventDefault();

                //Set the drop effect for the draggable image
                event.dataTransfer.dropEffect = 'copy';
            });

            /**
             * Bind canvas to drop event; prevent default behavior, read and load image into context
             */
            element.bind('drop', function (event) {

                event.stopPropagation();
                event.preventDefault();

                var canCopy = verifyFile(event);

                if (canCopy) {

                    var context = element[0].getContext('2d')

                    //Get the event files
                    for (iFileIndex = 0; iFileIndex < event.dataTransfer.files.length; iFileIndex++) {
                        
                        $scope.iNoOfFilespending++
                        $scope.$apply('iNoOfFilespending');

                        var file = event.dataTransfer.files[iFileIndex];

                        var reader = new FileReader();
                        
                                               
                        //File reader is loaded; load image
                        reader.onload = function (event)  {
                            $scope.iNoOfFilespending--;
                            $scope.$apply('iNoOfFilespending')
                            
                            var oParser = new DOMParser();
                            var oTranscriptDocument = oParser.parseFromString(event.target.result, "text/html");

                            var oTranscriptHead=getNodeListByXpath(oTranscriptDocument,"/html/head//meta")
                            var sTranscriptCreationDateTime=getAttributeByXpath(oTranscriptDocument,"/html/head/meta[@name='sametime:creationTime']/@content");
                            
                            sTranscriptCreationDateTime = sTranscriptCreationDateTime.substring(0, sTranscriptCreationDateTime.indexOf(' '));
                            
                            //console.log('aaaaa '+sTranscriptCreationDateTime +typeof(sTranscriptCreationDateTime));
                            
                            /*
                            for (iMetaIndex = 0; iMetaIndex < oTranscriptHead.length; iMetaIndex++) {
                                if (oTranscriptHead[iMetaIndex].getAttribute('name') == 'sametime:creationTime') {
                                    sTranscriptCreationDateTime = oTranscriptHead[iMetaIndex].getAttribute('content');
                                    sTranscriptCreationDateTime = sTranscriptCreationDateTime.substring(0, sTranscriptCreationDateTime.indexOf(' '));
                                }
                            }
                            console.log('bbbbb '+sTranscriptCreationDateTime+typeof(sTranscriptCreationTime));
                            */
                           
                             if (!$scope.data.chat[sTranscriptCreationDateTime] && 0)  {
                                var oTranscriptMessageDiv=getNodeListByXpath(oTranscriptDocument,"//div[starts-with(@class,'messageBlock')]")
                                //console.log(oTranscriptMessageDiv);
                                }
                           

                            if (!$scope.data.chat[sTranscriptCreationDateTime] && 1) {
                                //var oTranscriptDiv = oTranscriptDocument.getElementById('divTranscript');
                                
                                var jTranscripts = [{ "message": "unsupported file format" }];

                                //older version of ST
                                //if (!oTranscriptDiv) oTranscriptDiv = oTranscriptDocument.getElementsByTagName('div')[0];
                                //else 
                                    {
                                    var oTranscriptMessageDiv=getNodeListByXpath(oTranscriptDocument,"//div[starts-with(@class,'messageBlock')]")

                                    jTranscripts = [];

                                    for (iTranscriptIndex = 0; iTranscriptIndex < oTranscriptMessageDiv.length; iTranscriptIndex++) {

                                        sMessage = oTranscriptMessageDiv[iTranscriptIndex].innerText;
                                        sMessageDiv = oTranscriptMessageDiv[iTranscriptIndex].getElementsByTagName('div');
                                        if (sMessageDiv[1]) {
                                            var sUsername = sMessageDiv[1].getAttribute('title')
                                            if (sUsername.indexOf('/') > 0)
                                                sUsername = sUsername.substring(sUsername.indexOf(' - ') + 3, sUsername.indexOf('/'));
                                            else sUsername = sUsername.substring(0, sUsername.indexOf('['));
                                            //we need to build and keep updated distinct list of users
                                            if (!sUsername) {
                                                sUsername = oTranscriptMessageDiv[iTranscriptIndex].getAttribute('username');
                                            }
                                            sUsername=sUsername.trim();
                                            var sHashedUsername = md5(sUsername);
                                            //sMessageText='';

                                            //one or the scond ST msg version
                                            
                                            if (sMessageDiv.length >= 3 && sMessageDiv[2].innerText)
                                                var sMessageText = sMessageDiv[2].innerText
                                            else
                                                var sMessageText = sMessageDiv[1].innerText
                                           
                                            var iNoOfWords = getNumberOfWords(sMessageText);
 
                                            var sTimestamp=oTranscriptMessageDiv[iTranscriptIndex].getAttribute('timestamp');
                                            
                                            if (!sTimestamp)
                                                sTimestamp=oTranscriptMessageDiv[iTranscriptIndex].getElementsByClassName('showTimestamp tsDisplay')[0].innerText;

                                            if ($scope.data.user[sHashedUsername]) {
                                                if (iNoOfWords >= $scope.iMinWordLimitMessage) {
                                                    $scope.data.user[sHashedUsername].noOfWords += iNoOfWords;
                                                    $scope.data.user[sHashedUsername].authoredText += sMessageText + "\n";
                                                }
                                            }
                                            else {
                                                $scope.data.user[sHashedUsername] = {};
                                                $scope.data.user[sHashedUsername].id = sHashedUsername;
                                                $scope.data.user[sHashedUsername].status = "not analyzed yet";
                                                $scope.data.user[sHashedUsername].username = sUsername;
                                                $scope.data.user[sHashedUsername].noOfWords = 0;
                                                $scope.data.user[sHashedUsername].readyToAnalyze = false;
                                                $scope.data.isTranscriptUserFound = true;
                                                $scope.data.user[sHashedUsername].authoredText = "";

                                            }

                                            if ($scope.data.user[sHashedUsername].noOfWords >= $scope.iMinWordLimitTotal)
                                                $scope.data.user[sHashedUsername].readyToAnalyze = true;

                                            var jMessage = {
                                                "username": sUsername,
                                                "timestamp": sTimestamp,
                                                "message": sMessageText
                                            }

                                            jTranscripts.push(jMessage);
                                            //console.log (oTranscripts[iTranscriptIndex].innerText);
                                        }
                                        else {
                                            console.log('unknown (maybe older) format of Sametime transcript');
                                            break;
                                        }
                                    }
                                    //console.log(jTranscripts);

                                }
                                $scope.data.chat[sTranscriptCreationDateTime] = jTranscripts;
                                $scope.data.lastTranscriptCreationDateTime = sTranscriptCreationDateTime;
                                $scope.data.lastTranscriptUserId = sHashedUsername;
                                $scope.data.chat[sTranscriptCreationDateTime].name = file.name;
                                $scope.data.chat[sTranscriptCreationDateTime].lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString();
                       
                                $scope.$apply('data.user');
                                $scope.$apply('data.chat');

                                //console.log(JSON.stringify($scope.data.chat[sTranscriptCreationDateTime]));
                                //console.log(JSON.stringify($scope.data));
                            }
                            else console.log('This transcript is already parsed.')
                        
                        }

                        //Clear the canvas context
                        context.clearRect(0, 0, element[0].width, element[0].height);

                        //Load file reader
                        //reader.readAsDataURL(file);
                        reader.readAsText(file, 'ISO-8859-1');

                        //Get image name and date
                        //$scope.data.name = file.name;
                        //$scope.data.lastModified = new Date(file.lastModified).toLocaleDateString() + ' ' + new Date(file.lastModified).toLocaleTimeString();
                        $scope.$apply('data');
                    }
                }
                        
        });

            /**
             * Verify that there is only one draggable file and can be read as an image
             */
            var verifyFile = function (event) {

                //Get the event files
                var files = event.dataTransfer.files;

                //Ensure there is only one file and it is an image
                //if (files.length === 1 && ((typeof FileReader !== 'undefined' && files[0].type.indexOf('text/html') !== -1))) {
                for (j = 0; j < files.length; j++) {
                    if (!(((typeof FileReader !== 'undefined' && files[j].type.indexOf('text/html') !== -1)))) {
                        return false;
                    }
                }
                return true;
            };

            var getNumberOfWords = function (sText) {
                var s = sText ? sText.split(/\s+/) : 0; // it splits the text on space/tab/enter
                return s ? s.length : '';
            };

            var getNodeListByXpath = function (oDocument, sXpath) {
                var oResultEvaluated = oDocument.evaluate(sXpath, oDocument, null, XPathResult.ANY_TYPE, null);
                var oNodeList = [];

                if (oResultEvaluated) {

                    while (oThisNode = oResultEvaluated.iterateNext()) {
                        oNodeList.push(oThisNode)
                    }
                }
                return oNodeList;
            }

            var getAttributeByXpath = function (oDocument, sXpath) {
                var oResultEvaluated = oDocument.evaluate(sXpath, oDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                if (oResultEvaluated.singleNodeValue)
                    return (oResultEvaluated.singleNodeValue.textContent);
                else {
                    console.log("xpath '"+sXpath+"' not found")
                    return false;
                    }
            }


        }


    }

});