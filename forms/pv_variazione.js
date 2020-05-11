/**
 * @type {{ 
 *			  idditta: Number
 *			, iddipendenti: Array
 *			, periodo: Number
 *			, requestcode: String
 *			, requestid: Number
 *			, idrichieste: Array
 *			, requiredfields: String
 *			, callback: Function
 *			, autosave: Boolean
 *			, post_save_callback: Function
 *          , rulesobject: Object
 *          , requesttype: String
 * 		  }}
 *
 * @properties={typeid:35,uuid:"F6FB3DD2-73DF-42BD-BAED-F0CAE03C65C4",variableType:-4}
 */
var vParams;

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"94306B68-A761-417B-8A5A-EC6EFF091337"}
 */
function annullaRichiesta(event)
{
	resetStatus();
}

/**
 * TODO generated, please specify type and doc for the params
 * @param _event
 * @param _triggerForm
 * @param [_noConfirm]
 *
 * @properties={typeid:24,uuid:"FBD6F326-6A53-4070-80F5-75A0D858C41E"}
 */
function dc_cancel(_event, _triggerForm, _noConfirm)
{
	annullaRichiesta(_event);
}

/**
 * @param {JSEvent} event
 * @param {String} triggerForm
 * @param {String} [forceForm]
 * 
 * @properties={typeid:24,uuid:"DDB9BE5B-972C-4DE6-A1B9-10ECF8EA14CD"}
 */
function dc_save(event, triggerForm, forceForm)
{
	try
	{
	    // solo nel caso di voci multiple per singolo lavoratore chiama il metodo dc_save_validate_voci_multi
		var result = -1;
				     
		result = (utils.stringLeft(event.getFormName(),6) == 'form_v' && foundset.getSize() > 1) ? 
				     dc_save_validate_voci_multi(foundset,vParams) :
				     dc_save_validate(foundset, vParams.requiredfields)
						     
		if (result == -1)
			throw new Error('Controllare i valori inseriti');
		
		// save any pending edit before moving into save proper
		databaseManager.saveData(foundset);
		// actually start the save process
		databaseManager.startTransaction();
		
		result = dc_save_pre(foundset);
		if(result == -1)
			databaseManager.rollbackTransaction();
		else
		if (databaseManager.commitTransaction())
		{
			result = dc_save_post(foundset);
			// TODO PANNELLO VARIAZIONI se la transazione è andata a buon fine, segniamo come da inviare tutti quei 
			// lavoratori che sono stati oggetto di modifiche
//			if(foundset.getSize())
//			{
//				/** @type {Array<Number>}*/
//				var arrLavoratori = [];
//				for(var l = 1; l <= foundset.getSize(); l++)
//				{
//					if(arrLavoratori.indexOf(foundset.getRecord(l)['idlavoratore']) == -1)
//						arrLavoratori.push(foundset.getRecord(l)['idlavoratore']);
//			    }
//				
//				scopes.giornaliera.eliminaRegistrazione(arrLavoratori,vParams.periodo);
//			}
		}
		else
			throw new Error(databaseManager.getFailedRecords()[0].exception);
		
		return result;
	}
	catch(ex)
	{
		globals.ma_utl_logError(ex);
		databaseManager.rollbackTransaction();
		
		setStatusError(ex.message);
		
		return -1;
	}
}

/**
 * @param {JSEvent} event
 * @param {String} triggerForm
 * @param {String} [forceForm]
 * 
 * @properties={typeid:24,uuid:"099DCF4C-EEF2-497E-928C-0ACD68935B78"}
 */
function dc_save_detail(event, triggerForm, forceForm)
{
	try
	{
	    // solo nel caso di voci multiple per singolo lavoratore chiama il metodo dc_save_validate_voci_multi
		var result = -1;
				     
		result = (utils.stringLeft(event.getFormName(),6) == 'form_v' && foundset.getSize() > 1) ? 
			     dc_save_validate_voci_multi_detail(foundset,vParams) :
			     dc_save_validate_detail(foundset, vParams.requiredfields)
				     
		if (result == -1)
			return -1;
		
		// preparazione dell'inserimento nella tabella lavoratori_richieste_dettaglio	     
			     
		// save any pending edit before moving into save proper
		databaseManager.saveData(foundset);
		// actually start the save process
		databaseManager.startTransaction();
		
		result = dc_save_pre(foundset,true);
		if(result == -1)
			databaseManager.rollbackTransaction();
		else
		if (databaseManager.commitTransaction())
		{
			result = dc_save_post(foundset);
			// TODO PANNELLO VARIAZIONI se la transazione è andata a buon fine, segniamo come da inviare tutti quei 
			// lavoratori che sono stati oggetto di modifiche
//			if(foundset.getSize())
//			{
//				/** @type {Array<Number>}*/
//				var arrLavoratori = [];
//				for(var l = 1; l <= foundset.getSize(); l++)
//				{
//					if(arrLavoratori.indexOf(foundset.getRecord(l)['idlavoratore']) == -1)
//						arrLavoratori.push(foundset.getRecord(l)['idlavoratore']);
//			    }
//				
//				scopes.giornaliera.eliminaRegistrazione(arrLavoratori,vParams.periodo);
//			}
		}
		else
			throw new Error(databaseManager.getFailedRecords()[0].exception);
		
		return result;
	}
	catch(ex)
	{
		globals.ma_utl_logError(ex);
		databaseManager.rollbackTransaction();
		
		setStatusError('i18n:ma.err.generic_error');
		
		return -1;
	}
}

/**
 * @param {JSFoundset} fs
 * @param {Boolean} [detail]
 * 
 * @properties={typeid:24,uuid:"4B707000-2008-4D2D-A05A-0330F97CEC44"}
 */
function dc_save_pre(fs,detail)
{
	/** @type {Function} */
	var fCreaRichiesta     = vParams.crearichiesta     || detail ? creaRichiestaDetail : creaRichiesta;
	/** @type {Function} */
	var fAggiornaRichiesta = vParams.aggiornarichiesta || detail ? aggiornaRichiestaDetail : aggiornaRichiesta;
	
	if(_super.dc_save_pre(fs) !== -1)
	{
		var result;
		if(globals.nav.mode === globals.Status.ADD || status === globals.Status.ADD)
			result = fCreaRichiesta(fs, vParams, vParams.callback);
		else 
		if(globals.nav.mode === globals.Status.EDIT || status === globals.Status.EDIT)
			result = fAggiornaRichiesta(fs, vParams, vParams.callback);
		
		return result.returnValue;
	}
	
	return -1;
}

/**
 * @properties={typeid:24,uuid:"3C24F0D8-9A78-4788-A300-609AC0B0515C"}
 */
function dc_save_post(fs)
{
	if(vParams.post_save_callback)
		vParams.post_save_callback(vParams);
		
	databaseManager.setAutoSave(vParams.autosave);
	returnValue = 1;
	
	return returnValue;
}

/**
 * @param {JSFoundset} 	fs
 * @param 				params
 * @param {Function}  	[callback]
 * 
 * @return {{ returnValue: Number, [requests] }} returnValue = 0 means everything ok, -1 otherwise
 * 
 * @properties={typeid:24,uuid:"758A1DC3-D196-4110-8221-9AD1712D3344"}
 */
function creaRichiesta(fs, params, callback)
{
	return { returnValue: 0 };
}

/**
 * @param {JSFoundset} 	fs
 * @param 				params
 * @param {Function}  	[callback]
 * 
 * @return {{ returnValue: Number, [requests] }} returnValue = 0 means everything ok, -1 otherwise
 * 
 * @properties={typeid:24,uuid:"5807CDA0-321B-47DC-BEFE-1B9D13DB1715"}
 */
function creaRichiestaDetail(fs, params, callback)
{
	return { returnValue: 0 };
}

/**
 * @return {{ returnValue: Number, [request] }} returnValue = 0 means everything ok, -1 otherwise
 *
 * @properties={typeid:24,uuid:"D513DA51-3CE4-4432-8863-673239A0D16A"}
 */
function aggiornaRichiesta(fs, params, callback) 
{
	return { returnValue: 0 };
}

/**
 * @return {{ returnValue: Number, [request] }} returnValue = 0 means everything ok, -1 otherwise
 *
 * @protected 
 *
 * @properties={typeid:24,uuid:"97CE7594-2457-4608-91D3-1CF2620E7285"}
 */
function aggiornaRichiestaDetail(fs, params, callback) 
{
	return { returnValue: 0 };
}

/**
 * @protected
 * 
 * @properties={typeid:24,uuid:"865D2B51-1292-4E9A-9367-D8F209ACF22E"}
 */
function mapParamsToRequest(params, request)
{
	request.idtabstatooperazione		= globals.getStatusId(globals.RequestStatus.SUSPENDED);
	request.periodocedolino				= params.periodo;
	request.richiesta_data				= new Date();
	request.richiesta_utente			= globals.svy_sec_username;
	request.owner_id					= globals.svy_sec_lgn_owner_id;
	request.rettificaper				= params.rettificaper;
	
	return request;
}

/**
 * @protected
 * 
 * @properties={typeid:24,uuid:"4AEFAA12-8C77-47D0-9E42-FA23305BD54A"}
 */
function mapRequestToParams(request, params)
{
	params.periodo      = request.periodocedolino	;
	params.rettificaper	= request.rettificaper;
	
	return params;
}

/**
 * @param 			params
 * @param {Boolean}	multiple
 * @param {Form}	[extendsForm]
 * @param {String}	[formName]
 * @param			[data]
 * @param {
 * 			{ 
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number,
 * 				maxNoOfRows		: Number
 * 			}
 * 		  }			[layoutParams]
 *
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"B4CD0F2A-6D7C-4BBB-A818-AE465B6127B2"}
 */
function createRequestForm(params, multiple, extendsForm, formName, data, layoutParams)
{
	var specification = getSpecification(params);
	if(!specification || !params)
		return null;
	
	if(!params.datasource)
		params.datasource = ['ds', params.requestcode, params.rulecode].join('_');
	
	layoutParams = layoutParams || getLayoutParams(multiple);
	formName 	 = formName 	|| ['form', params.requestcode + '_' + params.rulecode, multiple ? 'tbl' : 'dtl'].join('_');
	var form = buildRequestForm(specification, params, multiple, formName, extendsForm, layoutParams);
	form = populateRequestForm(form, specification, params, data);
	forms[form.name]['vParams'] = params;
	forms[form.name]['vClose' ] = false;

	return form;
}

/**
 * @param params
 * @param {Boolean}	multiple
 * @param {Form}	[extendsForm]
 * @param {String}	[formName]
 * @param			[data]
 * @param {
 * 			{ 
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number,
 * 				maxNoOfRows		: Number
 * 			}
 * 		  }			[layoutParams]
 *
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"CA3A64BC-BA83-42AD-9F8B-6DD8082E3149"}
 */
function createRequestFormDetail(params, multiple, extendsForm, formName, data, layoutParams)
{
	var specification = getSpecification(params);
	if(!specification || !params)
		return null;
	
	if(!params.datasource)
		params.datasource = ['ds', params.requestcode, params.rulecode].join('_');
	
	layoutParams = layoutParams || getLayoutParams(multiple);
	formName 	 = formName 	|| ['form', params.requestcode + '_' + params.rulecode, multiple ? 'tbl' : 'dtl'].join('_');
	
	var form = buildRequestForm(specification, params, multiple, formName, extendsForm, layoutParams, true);
	    form = populateRequestFormDetail(form, specification, params, data);
		
	forms[form.name]['vParams'] = params;
	forms[form.name]['vClose' ] = false;

	globals.ma_utl_setStatus(globals.Status.ADD,form.name);
	
	return form;
}

/**
 * @param 			specification
 * @param 			params
 * @param {Boolean} multiple
 * @param {String}  [formName]
 * @param {Form}	[extendsForm]
 * 
 * @param {
 * 			{ 
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number,
 * 				maxNoOfRows		: Number
 * 			}
 * 		  }			[layoutParams]
 * @param {Boolean} [detail]
 * 
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"B0CD77A8-AE01-4B58-9780-5AFB830FF44C"}
 */
function buildRequestForm(specification, params, multiple, formName, extendsForm, layoutParams,detail)
{
	// TODO buildRequestForm : da verificare
//	if(detail)
//	{
		history.removeForm(formName);
		solutionModel.removeForm(formName);
//	}
	
	var form = solutionModel.getForm(formName);
	
	if(!form)
		form = buildForm
		(
			specification, 
			params, 
			multiple,
			formName,
			extendsForm,
			layoutParams,
			detail
		);
		
	return form;
}

/**
 * @properties={typeid:24,uuid:"A9B23D46-D34D-4396-946D-165582DDC350"}
 */
function populateRequestForm(form, specification, params, data)
{
	if(form)
	{
		var dsObject = getFormDataSet(specification, params); 
		populateDataSet(dsObject.dataset, specification, params, data);
		
		var dataSource = dsObject.dataset.createDataSource(params.datasource, dsObject.types);
		setRelations(dataSource, specification, params);
		setCalculations(dataSource, specification, params);
		
		if(!form.dataSource)
			form.dataSource = dataSource;
		
		// Create and save the required fields program and the fields to copy when in multi mode
		params = setRequiredFields(specification, 'PV_Req_' + form.dataSource, params, form.name);
		params = setFieldsToCopyBetweenRecords(params, specification);
	}
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"95F681B4-5FC8-499D-8EE4-B7139F744D83"}
 */
function populateRequestFormDetail(form, specification, params, data)
{
	if(form)
	{
		var dsObject = getFormDataSet(specification, params); 
		populateDataSet(dsObject.dataset, specification, params, data);
		
		var dataSource = dsObject.dataset.createDataSource(params.datasource, dsObject.types);
		setRelations(dataSource, specification, params);
		setCalculationsDetail(dataSource, specification, params);
		
		if(!form.dataSource)
			form.dataSource = dataSource;
		
		// Create and save the required fields program and the fields to copy when in multi mode
		params = setRequiredFields(specification, 'PV_Req_' + form.dataSource, params, form.name);
		params = setFieldsToCopyBetweenRecords(params, specification);
	} 
	
	return form;
}

/**
 * @return {Array}
 * 
 * @properties={typeid:24,uuid:"220F7D75-5DD5-4ED0-8110-B2E736D2F481"}
 */
function getSpecification(params)
{
	/** @type {Array} */
	var auxFields = [];
	
	/** @type {Array} */
	var specification = globals.getRequestForm(params);
	if (specification)
	{
		
		specification.forEach(function(_field){
			/** @type {
			 * 			{ 
			 * 				Code: String, 
			 * 				Name: String, 
			 * 				Format: String, 
			 * 				Size: Number, 
			 * 				Lines: Number, 
			 * 				Enabled: Boolean, 
			 * 				Visible: Boolean, 
			 * 				Order: Number, 
			 * 				Group: Number, 
			 * 				Type: String, 
			 * 				DataProvider: String, 
			 * 				Formula: String, 
			 * 				DisplayType: Number, 
			 * 				Regex: String, 
			 * 				OnAction: { name: String, code: String }, 
			 * 				LookupParams: String, 
			 * 				FilterQuery: String, 
			 * 				FilterArgs: String,
			 * 				Relation: String,
			 * 				ShownDataProvider: String, 
			 *              Tooltip: String,
			 *              HasDefault: Boolean,
			 *              DependsOn: String,
			 *              ContentDataProvider: String,
			 *              ShowCurrentValue : Boolean
			 * 			}
			 * 		} 
			 */
			var field = _field;
			// The field needs the current value to be displayed
			if(field.ShowCurrentValue)
			{
				/** @type{
				     *        {  
				 	 * 				Code: String, 
					 * 				Name: String, 
					 * 				Format: String, 
					 * 				Size: Number, 
					 * 				Lines: Number, 
					 * 				Enabled: Boolean, 
					 * 				Visible: Boolean, 
					 * 				Order: Number, 
					 * 				Group: Number, 
					 * 				Type: String, 
					 * 				DataProvider: String, 
					 * 				Formula: String, 
					 * 				DisplayType: Number, 
					 * 				Regex: String, 
					 * 				OnAction: { name: String, code: String }, 
					 * 				LookupParams: String, 
					 * 				FilterQuery: String, 
					 * 				FilterArgs: String,
					 * 				Relation: String,
					 * 				ShownDataProvider: String, 
					 *              Tooltip: String,
					 *              HasDefault: Boolean,
					 *              DependsOn: String,
					 *              ContentDataProvider: String,
					 *              ShowCurrentValue : Boolean
					 * 			}
					 * }
					 */
				var auxField 			     = globals.clone(field);
					auxField.DataProvider    += '_oldvalue';
					auxField.Name  		     += ' (v)';
					auxField.Enabled         = false;
					auxField.OnRender	     = false;
					auxField.IsCurrentValue  = true;
					auxField.Tooltip         = 'Valore corrente'
						
				// Move the original field on the next row
				field.Group += 1;
						
				if(field.Relation)
				{
					var relObject = plugins.serialize.fromJSON(field.Relation);
					if (relObject)
					{
						relObject.name += '_oldvalue';
						relObject.relationItems.forEach(function(item){
							if(item.parentDataProvider)
								item.parentDataProvider += '_oldvalue';		
						});
						
						// Remove leading underscores put in by the plugin
						auxField.Relation = plugins.serialize.toJSON(relObject).replace(/_([a-zA-Z]+)(\\?":)/g, '$1$2');
					}
				}
				
				auxFields.push(auxField);
			} // if showCurrentValue
		}); // forEach field
	}
	
	return auxFields.concat(specification);
}

/**
 * @properties={typeid:24,uuid:"762ED85D-FAA6-4339-9F95-3754F3DD3BA6"}
 */
function setFieldsToCopyBetweenRecords(params, specification)
{
	var fields = getFieldsToCopyBetweenRecords(params, specification);
	params.fieldstocopy = fields.fieldsToCopy;
	params.fieldstosave = fields.fieldsToSave;
	
	return params;
}

/**
 * @properties={typeid:24,uuid:"441C9E33-1FB9-426B-90D8-9FBE67E2A56B"}
 */
function getFieldsToCopyBetweenRecords(params, specification)
{
	var fieldsToSave, fieldsToCopy;
	fieldsToCopy = params.ammettedecorrenza ? ['decorrenza'] : [];
	fieldsToSave = fieldsToCopy.slice(0);
	
	specification.forEach
	(
		function(_field)
		{
			/** @type {
			 * 			{ 
			 * 				Code: String, 
			 * 				Name: String, 
			 * 				Format: String, 
			 * 				Size: Number, 
			 * 				Lines: Number, 
			 * 				Enabled: Boolean, 
			 * 				Visible: Boolean, 
			 * 				Order: Number, 
			 * 				Group: Number, 
			 * 				Type: String, 
			 * 				DataProvider: String, 
			 * 				Formula: String, 
			 * 				DisplayType: Number, 
			 * 				Regex: String, 
			 * 				OnAction: { name: String, code: String }, 
			 * 				LookupParams: String, 
			 * 				FilterQuery: String, 
			 * 				FilterArgs: String,
			 * 				Relation: String,
			 * 				ShownDataProvider: String, 
			 *              Tooltip: String,
			 *              HasDefault: Boolean,
			 *              DependsOn: String,
			 *              ContentDataProvider: String,
			 *              IsCurrentValue : Boolean 
			 * 			}
			 * 		} 
			 */
			 var field = _field;
			if(!field.DependsOn && !field.IsCurrentValue && field.Visible && field.Enabled)
			{
				fieldsToCopy.push(field.DataProvider);
				fieldsToSave.push(field.DataProvider);
				if(field.HasDefault)
					fieldsToCopy.push(field.DataProvider + '_setdefault');
			}
		}
	);
	
	return { fieldsToCopy: fieldsToCopy, fieldsToSave: fieldsToSave };
}

/**
 * @param 							  specification
 * @param 							  params
 * @param {Boolean} 				  multiple
 * @param {String}  				  [formName]
 * @param {Form}					  [extendsForm]
 * 
 * @param {{ sideMargin	  : Number, 
 * 			 topMargin	  : Number,
 * 			 bottomMargin : Number, 
 * 			 fieldHeight  : Number, 
 * 			 fieldSpacing : Number, 
 * 			 rowSpacing	  : Number, 
 * 			 labelHeight  : Number,
 * 			 maxNoOfRows  : Number }} [layoutParams]
 * 
 * @param {Boolean} [detail]
 * 
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"39C82B51-7EA2-4A4E-A6D0-387708CC13E6"}
 */
function buildForm(specification, params, multiple, formName, extendsForm, layoutParams, detail)
{
	formName     = formName || 'form_' + application.getUUID();
	extendsForm  = extendsForm || forms.master_form;
	
	var formType = multiple ? JSForm.LOCKED_TABLE_VIEW : JSForm.RECORD_VIEW;
	
	// Actually build the form
	var form;
	if(detail)
		form = globals.buildFormDetail(specification, formType, formName, extendsForm.controller.getName(), params.datasource, layoutParams, params);
	else
		form = globals.buildForm(specification, formType, formName, extendsForm.controller.getName(), params.datasource, layoutParams, params.requesttype);
		
	// Set some details
	form = form
			&& setFormDataProviders(form, params)
			&& setFormVariables(form, params, layoutParams, multiple)
			&& setBodyElements(form, params, layoutParams, multiple) 
			&& setFooterElements(form, params, layoutParams, multiple);
	
	return form;
}

/**
 * @properties={typeid:24,uuid:"9826243A-3691-4966-A1EC-BA52804C9AA0"}
 */
function getLayoutParams(multiple)
{
	/**
	 * Set some standard layout
	 */
	
	var layoutParams;
	
	if(multiple)
	{
		layoutParams =
		{
			  sideMargin 	: 0
			, fieldHeight	: 20
			, labelHeight	: 20
			, bottomMargin	: 10
			, maxNoOfRows	: 12
		}
	}
	else
	{
		layoutParams =
		{
			  sideMargin 	: 10
			, topMargin		: 0
			, bottomMargin	: 10
			, fieldHeight	: 20
			, fieldSpacing 	: 10
			, rowSpacing 	: 0
			, labelHeight	: 20
		}
	}
	
	return layoutParams;
}

/**
 * @param {String} 	dataSource
 * @param {Array}	specification
 * @param 			params
 * 
 * @properties={typeid:24,uuid:"7F7274F0-6871-4E22-B58A-C215EA0ED1E1"}
 */
function setCalculations(dataSource, specification, params)
{
	for (var f in specification)
	{
		/** @type {
		 * 			{ 
		 * 				Code: String, 
		 * 				Name: String, 
		 * 				Format: String, 
		 * 				Size: Number, 
		 * 				Lines: Number, 
		 * 				Enabled: Boolean, 
		 * 				Visible: Boolean, 
		 * 				Order: Number, 
		 * 				Group: Number, 
		 * 				Type: String, 
		 * 				DataProvider: String, 
		 * 				Formula: String, 
		 * 				DisplayType: Number, 
		 * 				Regex: String, 
		 * 				OnAction: { name: String, code: String }, 
		 * 				LookupParams: String, 
		 * 				FilterQuery: String, 
		 * 				FilterArgs: String,
		 * 				Relation: String,
		 * 				ShownDataProvider: String, 
		 *              Tooltip: String,
		 *              HasDefault: Boolean,
		 *              DependsOn: String,
		 *              ContentDataProvider: String
		 * 			}
		 * 		} 
		 */
		var field = specification[f];
		
		// If computed, create a new calculation
		switch(field.DisplayType)
		{
			case scopes.richieste.DisplayType.COMPUTED:
				var calc = solutionModel.getDataSourceNode(dataSource).getCalculation(field.DataProvider); 
				if(!calc)
					solutionModel.getDataSourceNode(dataSource).newCalculation
					(
						  "function " + field.DataProvider + "()\
						   {\
						   		return " + field.Formula + ";\
						   }"
					);
				
				break;
		}
	}
}

/**
 * @param {String} dataSource
 * @param {Array} specification
 * @param params
 *
 * @properties={typeid:24,uuid:"A21DCB5B-2501-4EF5-89E6-D167B15B5031"}
 */
function setCalculationsDetail(dataSource, specification, params)
{
	setCalculations(dataSource,specification,params);
}

/**
 * @properties={typeid:24,uuid:"3D9FD7CE-5820-46EC-AEDF-0A74FC023B3B"}
 */
function setRelations(dataSource, specification, params)
{
	if(specification)
	{
		specification.forEach
		(
			function(_field)
			{
				/** @type {
				 * 			{ 
				 * 				Code: String, 
				 * 				Name: String, 
				 * 				Format: String, 
				 * 				Size: Number, 
				 * 				Lines: Number, 
				 * 				Enabled: Boolean, 
				 * 				Visible: Boolean, 
				 * 				Order: Number, 
				 * 				Group: Number, 
				 * 				Type: String, 
				 * 				DataProvider: String, 
				 * 				Formula: String, 
				 * 				DisplayType: Number, 
				 * 				Regex: String, 
				 * 				OnAction: { name: String, code: String }, 
				 * 				LookupParams: String, 
				 * 				FilterQuery: String, 
				 * 				FilterArgs: String,
				 * 				Relation: String,
				 * 				ShownDataProvider: String, 
				 *              Tooltip: String,
				 *              HasDefault: Boolean,
				 *              DependsOn: String,
				 *              ContentDataProvider: String
				 * 			}
				 * 		} 
				 */
				var field = _field;
				// It the field is related, create a new relation for it
				if (field.Relation)
				{
					var relObject = plugins.serialize.fromJSON(field.Relation);
					if (relObject)
					{
						var relName = params.datasource + '_' + relObject.name;
						var rel = solutionModel.getRelation(relName);
						if(!rel)
						{
							rel = solutionModel.newRelation
									(
										  relName
										, dataSource
										, relObject.foreignDataSource
										, relObject.joinType
									);
									
							relObject.relationItems.forEach
							(
								function(item)
								{
									rel.newRelationItem
									(
										  item.parentDataProvider || field.DataProvider
										, item.comparisonOperator
										, item.childDataProvider
									)
								}
							);
						} // if !rel
					} // if relObject
				} // if relation
			} // forEach field
		);
	}
}

/**
 * @properties={typeid:24,uuid:"91AB02B5-1506-4DB1-9DA2-9FACAA375B90"}
 */
function setRequiredFields(specification, programName, params, form)
{
	var requiredFields = globals.getRequiredFields(specification, programName, params, form);
	if (requiredFields)
		params.requiredfields = requiredFields.program_name;
	
	return params;
}

/**
 * @param {JSForm} form
 * @param params
 * @param layoutParams
 * @param multiple 
 * 
 * @properties={typeid:24,uuid:"36801A9B-F626-407C-82FC-54B24A5EDA78"}
 */
function setBodyElements(form, params, layoutParams, multiple)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
	if(fs.metodoinizializzazione && fs.loadRecords(params.requestid))
	{
		var metodoinizializzazione = form.newMethod(fs.metodoinizializzazione);
		form.onShow = form.newMethod("function onShowForm(event, firstShow)\
										  {\
										  	_super.onShowForm(event, firstShow);"
										  	+ metodoinizializzazione.getName() + "();\
										  }"
										);
	}
	
	return form;
}

/**
 * @param {JSForm} 	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean} [multiple]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"43774584-AA44-4665-907B-A688BAFB0A46"}
 */
function setFooterElements(form, params, layoutParams, multiple)
{
	if (!form.getFooterPart())
		return form;
	
	var heightVariation = form.getFooterPart().getPartYOffset() - controller.getPartYOffset(JSPart.FOOTER);
	
	form.getFooterPart().height += heightVariation;
	
	var statusIcon 		 = form.getLabel(elements.icn_status.getName());
	var statusBackground = form.getLabel(elements.bgn_status.getName());
	var statusLabel 	 = form.getLabel(elements.lbl_status.getName());
	
	statusIcon.y 	   += heightVariation;
	statusBackground.y += heightVariation;
	statusLabel.y 	   += heightVariation;
	
	statusBackground.width =
	statusLabel.width 	   = form.width;
	
	statusIcon.formIndex = 100;
	statusLabel.formIndex = 100;
	statusBackground.formIndex = 0;
	
	if(multiple && form.getTabPanel('navigator'))
	{
		var navigator    = form.getTabPanel('navigator');
			navigator.y += heightVariation
	}
		
	return form;
}

/**
 * @param {JSForm} 	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean} [isMultiple]
 * @param 			[data]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"D508C168-B094-4204-B515-13C39A954EE4"}
 */
function setFormVariables(form, params, layoutParams, isMultiple, data)
{
	return form;
}

/**
 * Set the form's datasource. Each subform can override this method to add
 * or completely change the way the datasource is built.
 * 
 * @see getFormDataSet
 * 
 * @param {JSForm} 	form
 * @param 			params
 *
 * @return {JSForm}
 * 
 * @properties={typeid:24,uuid:"89818C8B-767C-4D59-BADB-BA123FC27486"}
 */
function setFormDataProviders(form, params)
{
	return form;
}

/**
 * @param specification
 * @param params
 * 
 * @return {{ dataset: JSDataSet, types: Array }}
 *
 * @properties={typeid:24,uuid:"A40FCDE4-FA83-4CE2-8D0B-E48EFEE31E81"}
 */
function getFormDataSet(specification, params)
{
	var columns = ['idrichiesta'   , 'idregola'		 , 'codiceregola', 'idditta'		,'idlavoratore'	  , 'codice'        , 'posizioneinps' , 'nominativo' , 'decorrenza',     'dettaglio',       'terminato'   ];
	var types 	= [JSColumn.INTEGER, JSColumn.INTEGER, JSColumn.TEXT , JSColumn.INTEGER	, JSColumn.INTEGER, JSColumn.INTEGER, JSColumn.INTEGER, JSColumn.TEXT, JSColumn.DATETIME, JSColumn.INTEGER, JSColumn.INTEGER];
		
	if(specification)
	{
		specification.forEach
		(
			function(_field)
			{
				/** @type {
				 * 			{ 
				 * 				Code: String, 
				 * 				Name: String, 
				 * 				Format: String, 
				 * 				Size: Number, 
				 * 				Lines: Number, 
				 * 				Enabled: Boolean, 
				 * 				Visible: Boolean, 
				 * 				Order: Number, 
				 * 				Group: Number, 
				 * 				Type: String, 
				 * 				DataProvider: String, 
				 * 				Formula: String, 
				 * 				DisplayType: Number, 
				 * 				Regex: String, 
				 * 				OnAction: { name: String, code: String }, 
				 * 				LookupParams: String, 
				 * 				FilterQuery: String, 
				 * 				FilterArgs: String,
				 * 				Relation: String,
				 * 				ShownDataProvider: String, 
				 *              Tooltip: String,
				 *              HasDefault: Boolean,
				 *              DependsOn: String,
				 *              ContentDataProvider: String
				 * 			}
				 * 		} 
				 */
				var field = _field;
				if(!field.DependsOn)
				{
					columns.push(field.DataProvider);
					types.push(globals.fieldTypeToJSColumn(field.Type));
					
					if(field.HasDefault)
					{
						columns.push(field.DataProvider + '_setdefault');
						types.push(JSColumn.INTEGER);
					}
				}
			}
		);
	}
		
	return { dataset: databaseManager.createEmptyDataSet(0, columns), types: types };
}

/**
 * @properties={typeid:24,uuid:"A697CE1D-B09E-4C8D-9E81-7363AD2E6603"}
 */
function populateDataSet(ds, specification, params, data)
{
	return ds;
}

/**
 * @properties={typeid:24,uuid:"2E788A4D-2C3E-4EEF-BE5D-F1DFF97BD729"}
 */
function getData(specification, params, data)
{
	data = data || {};
	
	for(var l = 0; l < params.iddipendenti.length; l++)
	{
		var lavoratore = params.iddipendenti[l];
		
		if(!data[lavoratore])
			data[lavoratore] = {};
		
		if(!data[lavoratore]['decorrenza'])
			data[lavoratore]['decorrenza'] = params.decorrenza;
		
		if(data[lavoratore]['dettaglio'] == null)
			data[lavoratore]['dettaglio'] = (params.dettaglio != null ? params.dettaglio : 0);
		
		if(data[lavoratore]['terminato'] == null)
			data[lavoratore]['terminato'] = (params.terminato != null ? params.terminato : 1);
		
		specification.forEach(function(_field){
			/** @type {
			 * 			{ 
			 * 				Code: String, 
			 * 				Name: String, 
			 * 				Format: String, 
			 * 				Size: Number, 
			 * 				Lines: Number, 
			 * 				Enabled: Boolean, 
			 * 				Visible: Boolean, 
			 * 				Order: Number, 
			 * 				Group: Number, 
			 * 				Type: String, 
			 * 				DataProvider: String, 
			 * 				Formula: String, 
			 * 				DisplayType: Number, 
			 * 				Regex: String, 
			 * 				OnAction: { name: String, code: String }, 
			 * 				LookupParams: String, 
			 * 				FilterQuery: String, 
			 * 				FilterArgs: String,
			 * 				Relation: String,
			 * 				ShownDataProvider: String, 
			 *              Tooltip: String,
			 *              HasDefault: Boolean,
			 *              DependsOn: String,
			 *              ContentDataProvider: String,
			 *              IsCurrentValue : Boolean
			 * 			}
			 * 		} 
			 */
			var field = _field;
			if(!field.DependsOn)
			{
				var value = null;
				
				if(field.IsCurrentValue)
					value = globals.getCurrentData(field, params, { 'idlavoratore': lavoratore, 'alladata': params.decorrenza });
				else
				{
					if(field.HasDefault)
						value = globals.getDefaultData(field, params.requestid, globals.ma_utl_lav_convertId(lavoratore));
					
					if(globals.ma_utl_isNullOrUndefined(value))
					{
						switch(field.DisplayType)
						{
							case scopes.richieste.DisplayType.FIXED:
								if(field.Type === globals.FieldType.NUMBER)
									value = globals.ma_utl_parseDecimalString(field.Formula);
								else
									value = field.Formula;
								break;
								
							case scopes.richieste.DisplayType.COMPUTED:
								value = globals.getDefaultValue(globals.fieldTypeToJSColumn(field.Type));
								break;
						}
					}
				}
				
				if(!data[lavoratore][field.DataProvider])
					data[lavoratore][field.DataProvider] = value;
			}
		});
	}
	
	return data;
}

/**
 * @return {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocampi>}
 * 
 * @properties={typeid:24,uuid:"D43C3350-D3D0-4020-B513-A4E1C8F50DA7"}
 */
function getRequestFields(requestid)
{
	return globals.getRequestFields(requestid);
}

/**
 * @properties={typeid:24,uuid:"DE870096-F246-44DD-A8CF-65BAA7B18B62"}
 */
function gotoNextRecord(event)
{
	var parent = globals.ma_utl_getParentForm(event.getFormName());
	if (parent)
	{
		var fs = forms[parent].foundset;
		if (fs.getSelectedIndex() === fs.getSize())
			fs.setSelectedIndex(1);
		else
			fs.setSelectedIndex(fs.getSelectedIndex() + 1);
	}
}

/**
 * @param {JSEvent} event
 * @param {Object} params
 * @param filterQuery
 * @param filterArgs
 * @param dataProvider
 * 
 * @properties={typeid:24,uuid:"4ADD8749-B8CA-42BD-9BC1-94FC27E86146"}
 */
function showLookup(event, params, filterQuery, filterArgs, dataProvider)
{
	if(!event.data)
		event.data = { };
	
	event.data.dataprovider = dataProvider;
	if(filterQuery)
	{
		event.data.filterQuery = filterQuery;
		if(filterArgs)
			event.data.filterArgs  = filterArgs;
	}
	
	params.event = event;
	params.lookup = params.lookup;
	
	globals.ma_utl_showLkpWindow(params);
}

/**
 * @properties={typeid:24,uuid:"F883308C-6D8D-4D26-990C-FBD366A411B3"}
 */
function filterByQuery(fs, event)
{
	/** @type {Array<Number>}*/
	var filterQuery  = event.data.filterQuery;
	/** @type {Array<Number>}*/
	var filterArgs   = event.data.filterArgs;
	
	if(filterQuery)
	{
		var ds = databaseManager.getDataSetByQuery
				(
						  globals.getSwitchedServer(globals.Server.MA_RICHIESTE)
						, globals.ma_utl_replaceCatalogs(filterQuery)
						, (filterArgs && filterArgs.map(function(arg){ return foundset[arg.name] || globals.getDefaultValue(arg.type); }) || [])
						, -1
				);
				
		// Select columns order must respect the alfabetical order!
		var pks = databaseManager.getTable(fs).getRowIdentifierColumnNames();
		
		for(var p = 0; p < pks.length; p++)
		{
			var pk = pks[p];
			var values = ds && ds.getColumnAsArray(p + 1);

			fs.addFoundSetFilterParam(pk, globals.ComparisonOperator.IN, values || []);
		}
	}

	return fs;
}

/**
 * @return {Array}
 * 
 * @properties={typeid:24,uuid:"E10BFF7D-E0F3-41F9-8C0B-FE4D0CE956EA"}
 */
function getFieldsToCopy()
{
	return vParams['fieldstocopy'];
}

/**
 * @properties={typeid:24,uuid:"114A189A-01AA-45B1-ACF4-DC4E5CAE29B4"}
 */
function getFieldsToSave()
{
	return vParams['fieldstosave'];
}

/**
 * @properties={typeid:24,uuid:"C5EF1D7B-775F-47FF-9798-D191C6B72C9B"}
 */
function onFieldRender(event)
{
	
}

/**
* @param {JSRenderEvent} event
 *
 * @properties={typeid:24,uuid:"37725DEF-97D9-47D5-83D6-6D4CEDD252FE"}
 */
function onOverwriteDefaultRender(event)
{
	var renderable = event.getRenderable();
	var record     = event.getRecord();
	
	if(record && renderable)
		renderable.enabled = !globals.ma_utl_isNullOrUndefined(record[renderable.getDataProviderID()]);
}

/**
 * @properties={typeid:24,uuid:"1BD11C19-D0F6-4465-ACA0-617F1FAE1D65"}
 */
function validateField(oldValue, newValue, event)
{
	var success 		  = true;
	var dataprovider      = event.getSource().getDataProviderID();
	var isNewValueDefined = !globals.ma_utl_isNullOrUndefined(newValue);

	if(isNewValueDefined)
	{
		if(newValue <= 0)
		{
			var message = 'Inserire un valore maggiore di 0';
		 	setStatusWarning(message, message, 0);
		 	success = false;
		}
		else
		{
			resetStatus();
		 	success = true;
		}
	}

	var overwriteDataprovider = dataprovider + '_setdefault';
	if(foundset.alldataproviders.indexOf(overwriteDataprovider) > -1)
	{
		if(isNewValueDefined)
		 	foundset[overwriteDataprovider] = 0;
		else
			foundset[overwriteDataprovider] = null;
	}
		 	
	return success;
}

/**
 * @properties={typeid:24,uuid:"3DFCD451-E066-4EE9-984E-C40514ABD6A1"}
 */
function validateFieldDetail(oldValue, newValue, event)
{
	//TODO validateFieldDetail : approntare modifiche per gestione della verifica post-inserimento
	var success 		  = true;
	var dataprovider      = event.getSource().getDataProviderID();
	var isNewValueDefined = !globals.ma_utl_isNullOrUndefined(newValue);

	if(isNewValueDefined)
	{
		if(newValue <= 0)
		{
			var message = 'Inserire un valore maggiore di 0';
		 	setStatusWarning(message, message, 0);
		 	success = false;
		}
		else
		{
			resetStatus();
		 	success = true;
		}
	}

	var overwriteDataprovider = dataprovider + '_setdefault';
	if(foundset.alldataproviders.indexOf(overwriteDataprovider) > -1)
	{
		if(isNewValueDefined)
		 	foundset[overwriteDataprovider] = 0;
		else
			foundset[overwriteDataprovider] = null;
	}
		 	
	return success;
}

/**
 * @param {JSFoundset} 	fs
 * @param {String} 		program
 * @param {Boolean} 	[multiple]
 * @param {Function}	[validator]
 * 
 * @properties={typeid:24,uuid:"322F53B9-F369-44E0-8121-E2112C472BC5"}
 */
function dc_save_validate_detail(fs, program, multiple, validator)
{
	try
	{
		var success = _super.dc_save_validate(fs, program) !== -1;
		
		/**
		 * Validate all records, not just the current one, if requested
		 */
		if(success && multiple)
		{
			fs = fs.duplicateFoundSet();
			for(var r = 1; r <= fs.getSize() && success; r++)
			{
				fs.setSelectedIndex(r);
				if(_super.dc_save_validate(fs, program) === -1 || (validator && !validator(fs.getSelectedRecord(), program)))
					success = false;
			}		
		}
		
		return success ? 0 : -1;
	}
	catch(ex)
	{
		application.output(ex.message, LOGGINGLEVEL.ERROR);
		setStatusError(ex.message, ex.message);
		
		return -1;
	}
}

/**
 * @param fs
 * @param params
 *
 * @properties={typeid:24,uuid:"3289791F-C043-49AE-853A-B3FA51630990"}
 */
function dc_save_validate_voci_multi(fs, params)
{
	var success = _super.dc_save_validate(fs,params.requiredfields,true) !== -1;
	success = success && validateRequiredFieldsVociMulti(fs,params);
	
	return success ? 0 : -1;
}

/**
 * @param fs
 * @param params
 *
 * @properties={typeid:24,uuid:"DC1CE615-BB94-4D6D-91DF-6FE54321AE2F"}
 */
function dc_save_validate_voci_multi_detail(fs, params)
{
	// TODO dc_save_validate_voci_multi_detail
}


/**
 * @param {JSFoundset} 	fs
 * @param {Object} params
 * 
 * @return {Boolean}
 *
 * @properties={typeid:24,uuid:"740606A8-2CDA-4E4C-903C-937FAAD646EA"}
 */
function validateRequiredFieldsVociMulti(fs,params)
{
	if(!fs)
		return true;
	
	var editedRecords = databaseManager.getEditedRecords(fs);
	
	var error = false;
	var msg			   = '';
	var found = false;
	
	for(var r = 0; r < editedRecords.length; r++)
	{
		var record 		   = editedRecords[r];
		if (record.getChangedData().getMaxRowIndex() > 0)
		{
			var specification = params['rulesObject'].RulesSpecification[record['idregola']];
			for(var f in specification)
			{
				if(specification[f].HasDefault || (specification[f].Enabled && !specification[f].DependsOn))
				   if(record[specification[f].DataProvider] == null)
				   {
						 //field is not entered
						msg += specification[f].DataProvider + i18n.getI18NMessage('svy.fr.dlg.is_required');
						error = found = true;
						break;
				   }
			}
									
			if(found)
				globals.nav.validation_msg += record[getRequestRelationName(vParams)]['descrizione'] + ': ' + msg + '\n';
		}
		
		if(error)
     		break;
	}
	
	if(error)
		globals.ma_utl_showErrorDialog(globals.nav.validation_msg);
	
	return !error;
}

/**
 * @properties={typeid:24,uuid:"44D77EEE-1FCF-432C-B4F2-D5123EAFF5EF"}
 */
function getRequestRelationName(params)
{
	return [params.datasource, 'to', 'tab_richiestedettaglio'].join('_');
}

/**
 * @properties={typeid:24,uuid:"37F74FF4-F173-47B7-90D2-8FD2B9807F86"}
 */
function getRuleRelationName(params)
{
	return [params.datasource, 'to', 'tab_richiestedettagliocondizioni'].join('_');
}
