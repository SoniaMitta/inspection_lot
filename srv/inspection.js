const cds = require('@sap/cds');
const axios = require('axios');
const { json2xml } = require('xml-js');

module.exports = cds.service.impl(async function () {
    const { A_InspectionLot, Forms } = this.entities;

    // Read operation for A_InspectionLot
    this.on('READ', A_InspectionLot, async (req) => {
        try {
            const productapi = await cds.connect.to('API_INSPECTIONLOT_SRV');
            req.query.SELECT.columns = [{ ref: ['InspectionLot'] }, { ref: ['Batch'] }, { ref: ['Material'] }];
            const result = await productapi.run(req.query);
            console.log('InspectionLot Data:', result);
            return result;
        } catch (error) {
            console.error('Error fetching data from external service:', error);
            return req.error(500, 'Failed to fetch data from external service');
        }
    });

    // Read operation for Forms
    this.on('READ', Forms, async (req) => {
        return [
            { FormName: 'PrePrintedLabel/Default' },
            { FormName: 'niharika/Default' },
            { FormName: 'sonia/Default' }
        ];
    });

    // Label generation for A_InspectionLot
    this.on('label', 'A_InspectionLot', async (req) => {
        const productapi = await cds.connect.to('API_INSPECTIONLOT_SRV');
        const { InspectionLot } = req.params[0];
        
        try {
            // Fetch inspection lot data
            const InspectionLots = await productapi.run(
                SELECT.from('A_InspectionLot').where({ InspectionLot }).columns('InspectionLot', 'Material', 'Batch')
            );

            const combinedResult = [];


            // Loop through each InspectionLot and fetch nested operations and characteristics
            for (let lot of InspectionLots) {
                const inspectionOperations = await productapi.run(
                    SELECT.from('A_InspectionOperation')
                        .where({ InspectionLot: lot.InspectionLot })
                        .columns('InspectionLot', 'InspectionOperation', 'InspectionOperationPlant')
                );
                for (let item of inspectionOperations) {

                    // Fetch PurOrderItemPricingElement for each PurchaseOrderItem
                    const inspectioncharacteristics = await productapi.run(
                        SELECT.from('A_InspectionCharacteristic')
                            .where({
                                InspectionLot: item.InspectionLot
                               
                            })
                            .columns(
                                'InspectionLot',
                                'InspectionCharacteristic',
                                'InspectionSpecification',
                                'InspectionSpecificationText'
                            )
                    );
                    

                    for (let result of inspectioncharacteristics) {

                        // Fetch PurOrderItemPricingElement for each PurchaseOrderItem
                        const inspectionresults = await productapi.run(
                            SELECT.from('A_InspectionResult')
                                .where({
                                    InspectionLot: result.InspectionLot,
                                    InspectionCharacteristic:result.InspectionCharacteristic
                                   
                                })
                                .columns(
                                    'InspectionLot',
                                    'InspectionCharacteristic',
                                    'Inspector',
                                    'CharacteristicAttributeCode'
                                )
                        );
                        
    
                        // Fetch PurchaseOrderScheduleLine for each PurchaseOrderItem
                       
                        
                       
                        result.inspectionresults = inspectionresults;
                        
                    }
                   
                    
                   
                    item.inspectioncharacteristics = inspectioncharacteristics;
                    
                }


                // Process operations to include nested characteristics
       

                // Add operations with nested characteristics inside the inspection lot
                combinedResult.push({
                  ...lot,
                  inspectionOperations:inspectionOperations
                });
            }

            // Convert the JSON structure to XML
            const wrappedJsonData = { InspectionLots: combinedResult };
            console.log('json data:',wrappedJsonData);
            const xmlOptions = { compact: true, ignoreComment: true, spaces: 4 };
            const xmlData = json2xml(wrappedJsonData, xmlOptions);
            console.log('xml data:',xmlData);
            const base64EncodedXML = Buffer.from(xmlData).toString('base64');

            console.log("XML Data (Base64 Encoded):", base64EncodedXML);

            // Fetch access token for PDF generation
            const authResponse = await axios.get('https://chembonddev.authentication.us10.hana.ondemand.com/oauth/token', {
                params: { grant_type: 'client_credentials' },
                auth: {
                    username: 'sb-ffaa3ab1-4f00-428b-be0a-1ec55011116b!b142994|ads-xsappname!b65488',
                    password: 'e44adb92-4284-4c5f-8d41-66f8c1125bc5$F4bN1ypCgWzc8CsnjwOfT157HCu5WL0JVwHuiuwHcSc='
                }
            });
            const accessToken = authResponse.data.access_token;
            console.log("Access Token Retrieved:", accessToken);

            // Generate PDF from XML data
            const pdfResponse = await axios.post('https://adsrestapi-formsprocessing.cfapps.us10.hana.ondemand.com/v1/adsRender/pdf?templateSource=storageName', {
                xdpTemplate: req.data.Forms,
                xmlData: base64EncodedXML,
                formType: "print",
                formLocale: "",
                taggedPdf: 1,
                embedFont: 0
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const fileContent = pdfResponse.data.fileContent;
            console.log("Generated PDF File Content:", fileContent);
            return fileContent;

        } catch (err) {
            console.error('Error during label generation:', err);
            return req.error(500, 'Error retrieving Purchase Orders and related data');
        }
    });
});