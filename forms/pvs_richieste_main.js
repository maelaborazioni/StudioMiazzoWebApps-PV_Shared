/** 
 * @type {Boolean}
 *
 * @properties={typeid:35,uuid:"3EF0AFAC-A25C-4C72-BB94-4D62F0771C42",variableType:-4}
 */
var filterDone = false;

/**
 * @properties={typeid:24,uuid:"C74D8AE5-5BA2-4B4B-B0F2-039EF80E8A2C"}
 */
function getButtonObject()
{
	var isSede = globals.ma_utl_hasKeySede();
	var btnObj = _super.getButtonObject();
		
		btnObj.forceValues = true;
		btnObj.btn_new     = { enabled: !isSede && (!foundset || foundset.getSize() >= 0) };
		btnObj.btn_edit    = 
		btnObj.btn_delete  = { enabled: !isSede };
		
	return btnObj;
}

/**
 * @properties={typeid:24,uuid:"E9DA619B-A72D-4C73-9C14-04D294487533"}
 */
function init(firstShow)
{
	_super.init(firstShow);
	
	filterDone = false;
	
	filterData(foundset);
	if(getFilterForm().isFiltered())
		getFilterForm().filter();
	
	filterDone = true;
	
	if(foundset.getSize() > 0)
		sort(foundset, sortFunction);
	else
		removeDetail();
	
	if(firstShow && foundset.getSize() > 0)
		updateDetail();
}

/**
 * @properties={typeid:24,uuid:"983870C8-2AF4-49CD-BAD7-B1DA8BF235C5"}
 */
function filterData(fs)
{
	fs.removeFoundSetFilterParam('ftr_lavoratori_richieste');
	fs.loadAllRecords();
	
	return fs;
}

/**
 * @properties={typeid:24,uuid:"E2BD8DF2-DAF1-4023-8A47-C08EF7FCA8C6"}
 */
function dc_delete_post(fs, multiDelete)
{
	if(_super.dc_delete_post(fs, multiDelete) !== -1)
	{
		if(globals.ma_utl_isFoundSetNullOrEmpty(fs))
			removeDetail();
		
		return 0;
	}
	
	return -1;
}

/**
 * @properties={typeid:24,uuid:"4F9F3A3A-3CC7-4389-993D-0B041EFF26E8"}
 */
function removeDetail()
{
	if(elements.detail_panel.getMaxTabIndex() > 1)
	{
		elements.detail_panel.tabIndex = 1;
		return elements.detail_panel.removeTabAt(2);
	}
	
	return true;
}

/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 * @param _form
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"5F9D549E-1EC7-45DF-8010-0F4A119971B0"}
 */
function onRecordSelection(event, _form)
{
	_super.onRecordSelection(event, _form);
	
	if(!filterDone)
		return;
	
	/**
	 * Create the detail form
	 */
	if(globals.ma_utl_isFoundSetNullOrEmpty(foundset))
		removeDetail();
	else 
		updateDetail();
}

/**
 * @properties={typeid:24,uuid:"77C3C859-8298-467E-A9EF-564809D75DC8"}
 */
function updateDetail()
{
}

/**
 * @protected 
 * 
 * @properties={typeid:24,uuid:"49876763-5875-4D70-B018-E54AD5671400"}
 */
function getParams(fs)
{
	var params =
	{ 
		  tipoconnessione		: globals.getTipoConnessione()
	};
	
	return params;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected 
 *
 * @properties={typeid:24,uuid:"7208EB76-2138-4C81-A9B7-6FEB604282BA"}
 */
function reload(event) 
{
	try
	{
		refreshRequests();
		if(globals.ma_utl_isFoundSetNullOrEmpty(foundset))
			removeDetail();
		else
		{
			globals.ma_utl_startTransaction();
			
			// We've updated all the requests, so just set the field 'aggiornatosede' to false
			var fsUpdater = databaseManager.getFoundSetUpdater(foundset);
				fsUpdater.setColumn('aggiornatosede', globals.FALSE)
				
			if(!fsUpdater.performUpdate())
				throw globals.ma_utl_getDatabaseErrors()[0];
				
			globals.ma_utl_commitTransaction();
			
			sort(foundset, sortFunction);
		}
	}
	catch(ex)
	{
		globals.ma_utl_rollbackTransaction();
		
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		setStatusError('i18n:ma.msg.generic_error');
	}
}

/**
 * @properties={typeid:24,uuid:"2E01D5FA-2229-451C-A12C-E74DD3104999"}
 */
function refreshRequests()
{
	databaseManager.refreshRecordFromDatabase(foundset, -1);
	setStatusSuccess('Aggiornamento terminato correttamente');
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"76CDF266-F8AB-4D83-B79E-ABB17E46EA55"}
 */
function onActionDeleteAll(event)
{
	if(globals.ma_utl_isFoundSetNullOrEmpty(foundset))
		return;
	
	var answer = globals.ma_utl_showYesNoQuestion(i18n.getI18NMessage('servoy.formPanel.deleteall.warning') + '\n<strong>Saranno eliminate le sole richieste visualizzate non ancora inviate.</strong>');
	if (answer && deleteAll() && globals.ma_utl_isFoundSetNullOrEmpty(foundset))
		removeDetail();
}

/**
 * @properties={typeid:24,uuid:"2915AE58-F542-4918-93D6-D1179F58EFFC"}
 */
function deleteAll()
{
	return true;
}

/**
 * @return {RuntimeForm<pvs_richieste_filter_dtl>}
 * 
 * @properties={typeid:24,uuid:"46EC687C-5698-430D-B7B6-5DB419297321"}
 */
function getFilterForm()
{
	return forms.pvs_richieste_filter_dtl;
}

/**
 * @properties={typeid:24,uuid:"D7727407-C39F-4D35-96E6-ACAA5F532D45"}
 */
function getDetailForm(params, edit)
{
	return forms.pv_variazione;
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"81B19CBF-FD68-4C12-8F30-49B69C69277B"}
 */
function onActionSendRequests(event) 
{
}
