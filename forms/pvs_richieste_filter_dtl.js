/**
 * @properties={typeid:35,uuid:"9CE47DF6-C8BD-4B59-B572-5982FBA6C84D",variableType:-4}
 */
var is_filtered = false;

/**
 * @type {JSRecord<db:/ma_richieste/tab_richiestedettaglio>}
 *
 * @properties={typeid:35,uuid:"3138C273-B492-40B8-905B-43C10B665781",variableType:-4}
 */
var request;

/**
 * @type {JSRecord<db:/ma_richieste/tab_richiestedettagliocondizioni>}
 *
 * @properties={typeid:35,uuid:"2C67FC33-4760-4E40-9657-C61890EC5FDE",variableType:-4}
 */
var rule;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"16E3E523-3D5F-4FF2-97C7-4DCCFD893489",variableType:8}
 */
var vCompanyID = null;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"990F077F-4BEC-4263-A79A-193944AB8B5E",variableType:93}
 */
var vDecorrenza;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"D4334FD9-DE49-46ED-B850-55440B3C9040",variableType:93}
 */
var vPeriodo;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"646336A4-A3AD-4ED6-B046-AF21E4E68AA0",variableType:8}
 */
var vRequestCategory;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"59E2826A-F51B-44DD-9AE8-367B9534AC0A"}
 */
var vRequestCode = '';

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"6B654088-8207-459B-92AD-992068B0BDDE",variableType:93}
 */
var vRequestDateFrom;

/**
 * @type {Date}
 *
 * @properties={typeid:35,uuid:"D6275C05-BB9F-4A33-AF1B-5EC53949A782",variableType:93}
 */
var vRequestDateTo;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"EA4A2101-2AD4-4B63-BAFA-F430822AABDB"}
 */
var vRequestDescription = '';

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"2309BBB9-9D98-4053-99D9-953659569F55",variableType:4}
 */
var vRequestStatus = null;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"2E0B4804-6840-4A7C-AA14-1F63D6CF8D59"}
 */
var vRuleCode = '';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"9CA0D077-F4C1-4197-8F52-4BD063E63835"}
 */
var vRuleDescription = '';

/**
 * @properties={typeid:24,uuid:"A1784D55-2E67-4D3B-A4BD-9EFF02988FEB"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	controller.readOnly = false;
}

/**
 * @properties={typeid:24,uuid:"A70056A7-8B2E-475C-A6C1-ED2045EE7FA8"}
 */
function getHistoryForm()
{
	return forms.pvs_richieste_main;
}

/**
 * @param {Boolean} [removeDetailIfEmpty]
 * 
 * @return {JSFoundset}
 *
 * @properties={typeid:24,uuid:"C8A154C7-1F8F-40FB-B20D-961D34C46FC6"}
 */
function filter(removeDetailIfEmpty) 
{
	setStatusNeutral('Filtro attivo');
	
	!is_filtered && toggleButtons();
	is_filtered = true;
	
	return foundset;
}

/**
 * @properties={typeid:24,uuid:"EF138210-8DD9-4247-90F1-6707060E3F3E"}
 */
function unfilter()
{
	reset();
	resetStatus();
	
	foundset.loadRecords();

	//is_filtered && 
	toggleButtons();
	is_filtered = false;
	
	return foundset; 
}

/**
 * @properties={typeid:24,uuid:"89019D7B-578F-44BE-B03E-3A21E2F705F2"}
 */
function isFiltered()
{
	return is_filtered;
}

/**
 * @properties={typeid:24,uuid:"1BF7006D-E7DD-4062-B585-18A64049AB81"}
 */
function filterRequest(fs)
{
	if(fs && vRequestCategory)
		fs.addFoundSetFilterParam('idtabrichiesta', globals.ComparisonOperator.EQ, vRequestCategory);
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"C8CFC69B-1ACD-4178-9164-B5FC09056B44"}
 */
function reset()
{
	request =
	rule =
	vRequestCategory =
	vPeriodo =
	vDecorrenza =
	vRequestDateFrom =
	vRequestDateTo =
	vRequestCode =
	vRequestDescription =
	vRuleCode =
	vRuleDescription =
	vRequestStatus = null;
}

/**
 * Handle changed data.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"02FF3F3E-388D-4169-83B0-97EE4782C819"}
 * @AllowToRunInFind
 */
function onDataChangeCodRichiesta(oldValue, newValue, event) 
{
	if(!newValue)
	{
		resetRequest();
		return true;
	}
		
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var requestDetailFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
		requestDetailFs = filterRequest(requestDetailFs);
		
	if (requestDetailFs && requestDetailFs.find())
	{
		requestDetailFs.codice = newValue;
		if(requestDetailFs.search() === 0)
			showRequestLookup(event);
		else
			updateRequest(requestDetailFs.getSelectedRecord());
			
		return true;
	}

	vRequestCode = oldValue;
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"94A10B33-F427-417F-8F72-C06BBAF6BDE1"}
 */
function updateRequest(rec)
{
	if(rec)
	{
		request 		    = rec;
		vRequestCode 	    = rec.codice;
		vRequestDescription = rec.descrizione;
	}
}

/**
 * @properties={typeid:24,uuid:"E049D35B-BEAD-487A-98B9-DF91F10E8BC1"}
 */
function showRequestLookup(event)
{
	return globals.ma_utl_showLkpWindow
	(
		{
			event							: event,
			lookup							: 'PV_Lkp_DettaglioRichiesta',
			allowInBrowse					: true,
			methodToExecuteAfterSelection	: 'updateRequest',
			methodToAddFoundsetFilter		: 'filterRequest',
			sortMethod						: 'sortRequest'
		}
	);
}

/**
 * @properties={typeid:24,uuid:"3E9FA8CF-FB47-4FB4-B4B1-EF2254BB594D"}
 */
function showRuleLookup(event)
{
	return globals.ma_utl_showLkpWindow
	(
		{
			event							: event,
			lookup							: 'PV_Lkp_RegolaRichiesta',
			allowInBrowse					: true,
			methodToExecuteAfterSelection	: 'updateRule',
			methodToAddFoundsetFilter		: 'filterRule'
		}
	);
}

/**
 * @properties={typeid:24,uuid:"729DE2E2-5A33-4D9F-8B9A-74987DC94B88"}
 */
function filterRule(fs)
{
	if(fs && request)
		fs.addFoundSetFilterParam('idtabrichiestadettaglio', globals.ComparisonOperator.EQ, request.idtabrichiestadettaglio);
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"FEC256B0-05CC-4BC7-A1C9-9AC378D06FDC"}
 */
function sortRequest(first, second)
{
	return sortRequests(first,second);
}

/**
 * @properties={typeid:24,uuid:"5CE0E601-7929-483B-B858-DA203C25CCB3"}
 */
function sortRequests(first, second)
{
	// Order by 'ordine', then by 'descrizione', null values come last
//	var    order  = globals.nullLastComparator(first, second, 'tab_richiestedettaglio_to_ditte_gestionerichieste.ordine');
//	return order || (first.descrizione < second.descrizione ? -1 : 1);
   
	return (first.descrizione < second.descrizione ? -1 : 1);
}

/**
 * Handle changed data.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"DC2DB7B9-C687-4685-991F-AE4EEA5BBED8"}
 * @AllowToRunInFind
 */
function onDataChangeCodRegola(oldValue, newValue, event) 
{
	if(!newValue)
	{
		resetRule();
		return true;
	}
	
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var ruleFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
	if (ruleFs && ruleFs.find())
	{
		ruleFs.codice = newValue;
		if(ruleFs.search() === 0)
			showRuleLookup(event);
		else
			updateRule(ruleFs.getSelectedRecord());
			
		return true;
	}

	vRequestCode = oldValue;
	
	return false;
}

/**
 * @properties={typeid:24,uuid:"201853D3-673D-4797-B8F3-AB37B0A7F112"}
 */
function updateRule(rec)
{
	if(rec)
	{
		rule			 = rec;
		vRuleCode 		 = rec.codice;
		vRuleDescription = rec.descrizione;
	}
}

/**
 * @properties={typeid:24,uuid:"075D7B06-349A-4C5C-95E8-BDD4CCFD379E"}
 */
function resetRule()
{
	rule = vRuleCode = vRuleDescription = null;
}

/**
 * @properties={typeid:24,uuid:"8F9F0ECB-079F-4C1D-B2E6-A898EEC2397A"}
 */
function resetRequest()
{
	request = vRequestCode = vRequestDescription = null;
}

/**
 * Handle changed data.
 *
 * @param oldValue old value
 * @param newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @returns {Boolean}
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"FC2E5C03-B21E-4071-A28A-49E8164363BC"}
 */
function onDataChangeCategoriaRichiesta(oldValue, newValue, event)
{
	resetRequest();
	return true
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"006B4AF4-21A0-47F5-87B0-EDD8486999AD"}
 */
function onAction$btn_filter(event) 
{
	sort(filter(true), sortFunction);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"D9D6C987-88AF-4D36-9A73-FDB974893BB8"}
 */
function onAction$btn_unfilter(event) 
{
	sort(unfilter(), sortFunction);
}

/**
 * @properties={typeid:24,uuid:"51F70D01-CBAD-4EE3-8133-818B7933E7EC"}
 */
function toggleButtons()
{
	elements.btn_unfilter.enabled = !elements.btn_unfilter.enabled;
}
