sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'inspection',
            componentId: 'A_InspectionLotObjectPage',
            contextPath: '/A_InspectionLot'
        },
        CustomPageDefinitions
    );
});