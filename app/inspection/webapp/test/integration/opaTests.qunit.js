sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'inspection/test/integration/FirstJourney',
		'inspection/test/integration/pages/A_InspectionLotList',
		'inspection/test/integration/pages/A_InspectionLotObjectPage'
    ],
    function(JourneyRunner, opaJourney, A_InspectionLotList, A_InspectionLotObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('inspection') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheA_InspectionLotList: A_InspectionLotList,
					onTheA_InspectionLotObjectPage: A_InspectionLotObjectPage
                }
            },
            opaJourney.run
        );
    }
);