sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'inspection',
            componentId: 'A_InspectionLotList',
            contextPath: '/A_InspectionLot'
        },
        CustomPageDefinitions
    );
});