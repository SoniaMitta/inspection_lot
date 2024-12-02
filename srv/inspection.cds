using { API_INSPECTIONLOT_SRV as external } from './external/API_INSPECTIONLOT_SRV';
service ins_report{
  entity Forms {
        key ID: UUID;
        FormName: String(80);
    }
entity A_InspectionLot as projection on external.A_InspectionLot actions{
    

      action label(
            //name: String(80) @Common.Label: 'name',
            //amount: String(80) @Common.Label: 'amount',
            Forms: String(80) @Common.Label: 'Forms' @Common.ValueList: {
              CollectionPath: 'Forms', 
              Label: 'Label',
              Parameters: [
                {
                  $Type: 'Common.ValueListParameterInOut',
                  LocalDataProperty: 'Forms',  
                  ValueListProperty: 'FormName'    
                }
              ]
            }) returns String;
  
  };
}
annotate ins_report.Forms with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: 'ID'
    },
    {
        $Type: 'UI.DataField',
        Value: 'FormName'
    }
]);
annotate ins_report.A_InspectionLot with @(
    UI.LineItem:[
        {
            $Type:'UI.DataField',
            Value: InspectionLot
        },
        {
            $Type:'UI.DataField',
            Value: Batch
        },
        {
            $Type:'UI.DataField',
            Value: Material
        },
        

    ]
);
//annotate Product with @odata.draft.enabled;

annotate ins_report.A_InspectionLot with @(
    UI.SelectionFields: [ InspectionLot , Batch, Material],  
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
          {
            $Type:'UI.DataField',
            Value: InspectionLot
        },
        {
            $Type:'UI.DataField',
            Value: Batch
        },
        {
            $Type:'UI.DataField',
            Value: Material
        },
            
        ]
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        }
    ]
);