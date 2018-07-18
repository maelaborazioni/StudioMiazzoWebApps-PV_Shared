/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"D8814534-72E7-4184-BF21-E10E32E6107E",variableType:4}
 */
var ma_pv_to_tab_richiestedettagliocampi_valoriadipendente$idlavoratore = null;

/**
 * @type {Number}
 * 
 * @properties={typeid:35,uuid:"9C1D1D1B-B920-4A15-A58F-F02F4A9CAD2E",variableType:4}
 */
var ma_pv_to_tab_richiestedettagliocampi_valoriadipendente$idcampo = null;

/**
 * @properties={typeid:35,uuid:"07B201C6-B3E4-4C60-B9FA-D43D6A452AFA",variableType:-4}
 */
var RequestStatus =
{
	SUSPENDED		: 'SOSP' ,
	SENT			: 'TX'   ,
	RECEIVED		: 'RX'   ,
	IN_PROCESS		: 'PROC' ,
	PROCESSED		: 'ELAB' ,
	CANCELED		: 'ANN'  ,
	OVERWRITTEN 	: 'RETT' ,
	EXPIRED			: 'SCAD' ,
	TO_CANCEL		: 'DANN' ,
	TO_OVERWRITE	: 'DRETT'
};

/**
 * @properties={typeid:35,uuid:"C4629F81-E803-494D-BA22-181546DC65C5",variableType:-4}
 */
var TipoRettifica =
{
	NESSUNA:		0,
	ANNULLAMENTO:	1,
	MODIFICA:		255
};

/**
 * @properties={typeid:35,uuid:"736F192E-5568-44AA-8635-C6312BD01715",variableType:-4}
 */
var TipoStatoInserimento =
{
	IN_CORSO: 0,
	TERMINATO: 1
}

/**
 * @properties={typeid:35,uuid:"91FB8291-DE80-48ED-B4AB-73CED7289839",variableType:-4}
 */
var PV_Controllers =
{
	VOCE       : 'Variazioni',
	LAVORATORE : 'VariazioniLavoratore'
};

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"F382ED46-08EB-4126-AD90-C2693324768D"}
 */
var COD_RICHIESTA_ANAGRAFICA = 'AG';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"798D415D-35EB-4F92-8BDE-30D5D300FA5B"}
 */
var COD_RICHIESTA_INQUADRAMENTO = 'INQ';

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"35038101-1AC7-4E87-B221-02A8D75E408A"}
 */
var COD_RICHIESTA_MONETARIA = 'MON';

/**
 * @properties={typeid:35,uuid:"BC9E5E9A-7A91-4759-A767-9F55E3D126A8",variableType:-4}
 */
var CategoriaRichiesta =
{
	ANAGRAFICA		: COD_RICHIESTA_ANAGRAFICA,
	INQUADRAMENTO	: COD_RICHIESTA_INQUADRAMENTO,
	MONETARIA		: COD_RICHIESTA_MONETARIA
}

/**
 * @properties={typeid:35,uuid:"5C8841D4-DB4B-483D-AF5F-440FE53B9119",variableType:-4}
 */
var TipoRichiesta =
{
	SINGOLA			: 0,
	MULTIPLA		: 1
}

/**
 * @properties={typeid:35,uuid:"A97D27E1-4C1F-46D0-B967-88405FCD923C",variableType:-4}
 */
var CodiceRegola = { GENERALE: 1 };

/**
 * Filtra i lavoratori della ditta specificata in base alla regola
 * 
 * @param {Number} ruleID
 * @param {Number} companyID
 * @param {Number} periodo
 * @param {String} gruppolavoratori
 * 
 * @return {Array}
 *
 * @properties={typeid:24,uuid:"CCB9FA4B-3D61-442D-B9FD-76D09F9209E1"}
 */
function getAvailableEmployees(ruleID, companyID, periodo, gruppolavoratori)
{
	var params =
	{
		tipoconnessione		: globals.getTipoConnessione(),
		idditta				: companyID,
		ruleid				: ruleID,
		periodo				: periodo,
		gruppolavoratori	: gruppolavoratori
	}
		
	var url = [globals.WS_PV_URL, 'VariazioniLavoratore', 'FiltraLavoratoriPerRegola'].join('/');
	/** @type {{ lavoratori: Array }} */
	var response = globals.getWebServiceResponse(url, params);
	
	if(response.lavoratori)
		return response.lavoratori;
	
	return [];
}

/**
 * Ritorna le richieste disponibili per la ditta
 * 
 * @param {Number} companyID
 * @param {Number} [periodo]
 * 
 * @return {Array}
 *
 * @properties={typeid:24,uuid:"A58A99C9-26CA-4070-BCD3-A6BD7F063711"}
 */
function getAvailableRequests(companyID, periodo)
{
	var requests = [];
	
	var sqlQuery = "SELECT idTabRichiestaDettaglio FROM [dbo].[F_Ditta_RichiesteAmmesse](?,?,?) ORDER BY CodiceRichiesta";
	
	var asOfDate = periodo ? globals.toDate(periodo) : globals.TODAY;
	
	var dataset  = databaseManager.getDataSetByQuery(globals.Server.MA_RICHIESTE, sqlQuery, [companyID, asOfDate, isCliente() ? 1 : 0], -1);
	
	if(dataset)
		requests = dataset.getColumnAsArray(1);
	
	return requests;
}

/**
 * @return {Array<Number>}
 * 
 * @properties={typeid:24,uuid:"BC0B8733-CBAC-437F-9955-4433FE1BFA4D"}
 */
function getAvailableRules(companyID, periodo, idRichiesta)
{
	var rules = [];
	
	var asOfDate = periodo ? globals.toDate(periodo) : globals.TODAY;
	
	var sqlQuery = "SELECT idTabRichiestaDettaglioCondizione FROM [dbo].[F_Ditta_RichiesteAmmesse](?,?,?) WHERE idTabRichiestaDettaglio = ?";
	var dataset  = databaseManager.getDataSetByQuery(globals.Server.MA_RICHIESTE, sqlQuery, [companyID, asOfDate, isCliente() ? 1 : 0, idRichiesta], -1);
	
	if(dataset)
		rules = dataset.getColumnAsArray(1);
	
	return rules;
}

/**
 * @properties={typeid:24,uuid:"6C1AF326-F974-4D6C-A91F-03C699B983FA"}
 */
function getAvailableRequestsWithRules(companyID, employeeID, periodo, categoryID, gruppolavoratori)
{
	var url    = [globals.WS_PV_URL, 'VariazioniLavoratore', 'FiltraRichiesteRegoleLavoratore'].join('/');
	var params =
	{
		  tipoconnessione	: globals.getTipoConnessione()
		, idditta			: companyID
		, iddipendenti		: [employeeID]
		, periodo			: periodo
		, idcategoria		: categoryID
		, gruppolavoratori  : gruppolavoratori
	}
	/** @type {{ rulesperrequest, rules, rulesspecification }} */
	var response = globals.getWebServiceResponse(url, params);
	if (response)
		return { rulesPerRequest: response.rulesperrequest, rules: response.rules, rulesSpecification: response.rulesspecification };
	
	return null;
}

/**
 * @properties={typeid:24,uuid:"DEE79606-E7B3-49FF-AE08-F9B9F92FD9D4"}
 * @AllowToRunInFind
 */
function getUsedRequests(companyID, periodo, categoryID, codGruppoLavoratori)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
	if (fs && fs.find())
	{
		fs.idditta 														 = companyID;
		fs.periodocedolino 												 = periodo;
		fs.lavoratori_richieste_to_tab_richiestedettaglio.idtabrichiesta = categoryID;
		
		fs.search();
	}
	
	return globals.foundsetToArray(fs, 'idtabrichiestadettaglio');
}

/**
 * @properties={typeid:24,uuid:"55C3C50D-31BC-4ACE-A571-41519718B3AF"}
 * @AllowToRunInFind
 */
function getUsedRequestsFromTo(companyID, periodoDal, periodoAl, categoryID, codGruppoLavoratori)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
	if (fs && fs.find())
	{
		fs.idditta 														 = companyID;
		fs.periodocedolino 												 = '>=' + periodoDal;
		fs.periodocedolino 												 = '<=' + periodoAl;
		fs.lavoratori_richieste_to_tab_richiestedettaglio.idtabrichiesta = categoryID;
		
		fs.search();
	}
	
	return globals.foundsetToArray(fs, 'idtabrichiestadettaglio');
}

/**
 * @param {JSRecord<db:/ma_richieste/tab_richiestedettagliocondizioni>} rule
 *
 * @properties={typeid:24,uuid:"715F8FAF-4DD2-4727-98F2-CD9E75A97228"}
 * @AllowToRunInFind
 */
function validateRule(rule)
{
	if(!rule)
		throw new Error('No rule provided');

	var fs = rule.foundset.duplicateFoundSet();
	if (fs && fs.find())
	{
		fs.codice  = rule.codice;
		fs.idditta = rule.idditta && '!=' + rule.idditta;
		
		if(fs.search() > 0)
		{
			var msg = 'Codice ' + rule.codice + ' già utilizzato';
			if(fs.idditta)
				msg += ' per la ditta\n\n' + fs.tab_richiestedettagliocondizioni_to_ditte.codice_ragionsociale;
			
			throw new Error(msg);
		}
		
		return true;
	}
	
	return false;
}

/**
 * @param {JSRecord<db:/ma_richieste/tab_richiestedettaglio>} request
 *
 * @properties={typeid:24,uuid:"1D09A797-4914-4054-9DAE-EE176F9FDDC8"}
 * @AllowToRunInFind
 */
function validateRequest(request)
{
	if(!request)
		throw new Error('No request provided');

	var fs = request.foundset.duplicateFoundSet();
	if (fs && fs.find())
	{
		fs.codice  = request.codice;
		if(fs.search() > 0)
		{
			var msg = 'Codice ' + request.codice + ' già utilizzato';
			throw new Error(msg);
		}
		
		return true;
	}
	
	return false;
}

/**
 * Recupera la form per la richiesta di variazione specificata (singola o multipla)
 * 
 * @param 			params i parametri della richiesta
 * 
 * @return JSForm
 * 
 * @properties={typeid:24,uuid:"066D9C27-20EE-49C1-AD5E-B6D8A81C9E5D"}
 */
function getRequestForm(params)
{
	var url 	 = [globals.WS_PV_URL, params.controller, 'Build'].join('/');
	var response =  globals.getWebServiceResponse(url, params);

	return response && response.form;
}

/**
 * @return {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocampi>}
 * 
 * @properties={typeid:24,uuid:"B38AB002-EE6F-4872-9014-6E8DF1BA8579"}
 * @AllowToRunInFind
 */
function getRequestFields(requestid)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
	if (requestFs && requestFs.find())
	{
		requestFs.idtabrichiestadettaglio = requestid;
		requestFs.tab_richiestedettaglio_to_tab_richiestedettagliocampi.dipendeda = '^||<=0';
		
		requestFs.search();
		
		return requestFs.tab_richiestedettaglio_to_tab_richiestedettagliocampi;
	}
	
	return null;
}

/**
 * @AllowToRunInFind
 * 
 * @param requestid
 *
 * @properties={typeid:24,uuid:"0C193806-1CDB-4412-8477-A7901DFD3A65"}
 */
function getRequestType(requestid)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettaglio>} */
	var requestFs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.DETTAGLIO_RICHIESTE);
	if (requestFs && requestFs.find())
	{
		requestFs.idtabrichiestadettaglio = requestid;
	
		if(requestFs.search())		
			return requestFs.tab_richiestedettaglio_to_tab_richieste.codice;	
	}
	
	return null;
}

/**
 * Create a fake program object for use in validation. Fields are
 * marked mandatory according to the provided specification.
 * Please note any pre-existing program by the same name would be
 * overwritten
 * 
 * @param 			specification
 * @param {String}  programName		the name the program can be accessed with
 * 									through <code>globals.nav.program</code>
 * @param 			params
 * @param {String}  [form]			the name of the form (if there are related fields)
 * 
 * @return {{ program_name: String, required_fields }}
 *
 * @properties={typeid:24,uuid:"7531DABB-E0CF-479A-8635-8E88B8948848"}
 */
function getRequiredFields(specification, programName, params, form)
{
	var requiredFieldsProgram = { program_name: programName, required_fields: { } };
	for(var f = 0; f < specification.length; f++)
	{
		/** @type {{ dataprovider: String, mandatory: Boolean, relation: String, contentdataprovider : String, name : String }} */
		var field = specification[f];
		
		// Exclude hidden or disabled fields 
		if (field.mandatory && field.enabled && field.visible)
		{
			var dataProvider = field.dataprovider;
			
			if(field.relation)
			{
				var relObject = plugins.serialize.fromJSON(field.relation);
				if (relObject)
					dataProvider = params.datasource + '_' + relObject.name + '.' + field.contentdataprovider;
			}
			
			requiredFieldsProgram.required_fields[dataProvider] =
			{
				  db_status		: 'R'
				, req_by_prog	: true
				, form_status	: 'R'
				, on_form		: true	// needed for the check to work even if the form has not yet been shown
				, original_dp   : field.dataprovider
				, field_name	: field.name
			}
		}
	}
	
	if(params.ammettedecorrenza)
		requiredFieldsProgram.required_fields['decorrenza'] =
		{
			  db_status		: 'R'
			, req_by_prog	: true
			, form_status	: 'R'
			, on_form		: true	// needed for the check to work even if the form has not yet been shown
		}
	
	if(!globals.areEqual(requiredFieldsProgram.required_fields, { }))
	{
		globals.nav.program[programName] = requiredFieldsProgram;
		return requiredFieldsProgram;
	}
	
	return null;
}

/**
 * @properties={typeid:24,uuid:"7D9B60F8-40F7-41FC-86E9-AEC9A73F800B"}
 * @AllowToRunInFind
 */
function getCurrentData(field, params, argsValues)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocampi>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.CAMPI_RICHIESTE);
	if (fs && fs.find())
	{
		fs.idtabrichiestadettaglio = params.requestid;
		fs.codice = field.code;
		
		if(fs.search() === 0)
			return null;
	}
	
	var sqlQuery = fs.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_query && fs.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_query.currentvaluequery;
	if(!sqlQuery)
		return null;

	// Replace hq catalogs with the client's
	sqlQuery = globals.ma_utl_replaceCatalogs(sqlQuery).replace(/\\'/g, "'");
	
	var args = fs.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_query && fs.tab_richiestedettagliocampi_to_tab_richiestedettagliocampi_query.currentvalueargs;
	if (args)
		args = plugins.serialize.fromJSON(args);
	else
		args = null;
	
	var value = databaseManager.getDataSetByQuery
				(
					  globals.Server.MA_RICHIESTE
					, sqlQuery
					, args.map(function(arg){ return argsValues[arg]; })
					, -1
				);
	
	return value && value.getValue(1, 1);
}

/**
 * @properties={typeid:24,uuid:"2603ED8D-72A9-4FDD-8762-CCB704046162"}
 * @AllowToRunInFind
 */
function getDefaultData(field, idrichiesta, idlavoratore)
{
	/** @type {JSFoundSet<db:/ma_richieste/tab_richiestedettagliocampi_valoriadipendente>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.VALORI_CAMPI_RICHIESTE);
	if (fs && fs.find())
	{
		fs.tab_richiestedettagliocampi_valoriadipendente_to_tab_richiestedettagliocampi.idtabrichiestadettaglio = idrichiesta;
		fs.tab_richiestedettagliocampi_valoriadipendente_to_tab_richiestedettagliocampi.codice = field.code;
		fs.idlavoratore = idlavoratore;
		
		if(fs.search() === 0)
			return null;
	}
	
	return fs.valore;
}

/**
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"D929E3C9-86E0-4146-9537-EC6F65C2CDAC"}
 */
function findExpiredRequests(idditta)
{
	var sqlQuery = "SELECT idLavoratoreRichiesta FROM [dbo].[F_Ditta_RichiesteScadute](?)";
	var dataset  = databaseManager.getDataSetByQuery(globals.Server.MA_RICHIESTE, sqlQuery, [idditta], -1);
	
	var requests = dataset && dataset.getColumnAsArray(1);
	if(!requests)
		throw globals.ma_utl_getDatabaseErrors()[0];
	
	return requests;
}

/**
 * @properties={typeid:24,uuid:"1B9EDF93-81C4-4D80-AAB0-F61535648207"}
 */
function updateRequestsAsSent(requests, date, user)
{
	if(globals.ma_utl_isNullOrEmpty(requests))
		return true;
	
	var requests_id = requests.join(',');
	
	// Use rawSQL, since the foundset updater seems to trigger unwanted onRecordSelection events...
	var sqlQuery = "BEGIN TRY\
						BEGIN TRAN\
						\
						UPDATE\
							[dbo].[Lavoratori_Richieste]\
						SET\
							idtabstatooperazione = (SELECT idtabstatooperazione FROM [dbo].[Tab_StatoOperazioni] WHERE Codice = ?),\
							Invio_Data = ?,\
							Invio_Utente = ?\
						WHERE\
							idlavoratorerichiesta IN (" + requests_id + ");\
						\
						UPDATE\
							[dbo].[Lavoratori_RichiesteCampi]\
						SET\
							Inviato = 1\
						WHERE\
							idlavoratorerichiesta IN (" + requests_id + ");\
						\
						COMMIT TRAN\
					END TRY\
					BEGIN CATCH\
						ROLLBACK TRAN\
					END CATCH";
	
	var success = plugins.rawSQL.executeSQL
					(
						  globals.Server.MA_RICHIESTE
						, globals.Table.LAVORATORI_RICHIESTE
						, sqlQuery
						, [globals.RequestStatus.SENT, date, user]
					);
					
	if(!success)
		throw new Error(plugins.rawSQL.getException().getMessage());
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"6F175260-7232-49B7-A0C1-2A33066E3735"}
 */
function updateRequestStatus(requests, status)
{
	if(globals.ma_utl_isNullOrEmpty(requests))
		return true;
	
	// Use rawSQL, since the foundset updater seems to trigger unwanted onRecordSelection events...
	var sqlQuery = "UPDATE\
						[dbo].[Lavoratori_Richieste]\
					SET\
						idtabstatooperazione = (SELECT idtabstatooperazione FROM [dbo].[Tab_StatoOperazioni] WHERE Codice = ?)\
					WHERE\
						idlavoratorerichiesta IN (" + requests.join(',') + ");"; 
	
	var success = plugins.rawSQL.executeSQL
					(
						  globals.Server.MA_RICHIESTE
						, globals.Table.LAVORATORI_RICHIESTE
						, sqlQuery
						, [status]
					);
					
	if(!success)
		throw new Error(plugins.rawSQL.getException().getMessage());
	
	return true;
}

/**
 * @param requests
 *
 * @properties={typeid:24,uuid:"46A30EE5-F70C-405D-852E-411117CE5A2E"}
 */
function updateRequestTermination(requests)
{
	if(globals.ma_utl_isNullOrEmpty(requests))
		return true;
	
	// Use rawSQL, since the foundset updater seems to trigger unwanted onRecordSelection events...
	var sqlQuery = "UPDATE \
						[dbo].[Lavoratori_Richieste] \
					SET\
						terminato = 1 \
					WHERE \
						idlavoratorerichiesta IN (" + requests.join(',') + ");"; 
	
	var success = plugins.rawSQL.executeSQL
					(
						  globals.Server.MA_RICHIESTE
						, globals.Table.LAVORATORI_RICHIESTE
						, sqlQuery
						, null
					);
					
	if(!success)
		throw new Error(plugins.rawSQL.getException().getMessage());
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"80FED0EB-CF24-4561-9A8D-5DD6BF643448"}
 */
function updateRequestSentInfo(requests, info)
{
	if(globals.ma_utl_isNullOrEmpty(requests))
		return true;
	
	// Use rawSQL, since the foundset updater seems to trigger unwanted onRecordSelection events...
	var sqlQuery = "UPDATE\
						[dbo].[Lavoratori_Richieste]\
					SET\
						  Invio_Data = ?\
						, Invio_Utente = ?\
					WHERE\
						idlavoratorerichiesta IN (" + requests.join(',') + ");"; 
	
	var success = plugins.rawSQL.executeSQL
					(
						  globals.Server.MA_RICHIESTE
						, globals.Table.LAVORATORI_RICHIESTE
						, sqlQuery
						, [info.date, info.user]
					);
					
	if(!success)
		throw new Error(plugins.rawSQL.getException().getMessage());
	
	return true;
}

/**
 * @properties={typeid:24,uuid:"661EDA3B-692B-43BE-A132-E27EEA634060"}
 */
function updateFieldsStatus(fields, status)
{
	if(globals.ma_utl_isNullOrEmpty(fields))
		return true;
	
	// Use rawSQL, since the foundset updater seems to trigger unwanted onRecordSelection events...
	var sqlQuery = "UPDATE\
						[dbo].[Lavoratori_RichiesteCampi]\
					SET\
						inviato = ?\
					WHERE\
						idlavoratorerichiestacampo IN (" + fields.join(',') + ");"; 
	
	var success = plugins.rawSQL.executeSQL
					(
						  globals.Server.MA_RICHIESTE
						, globals.Table.LAVORATORI_CAMPI
						, sqlQuery
						, [status]
					);
					
	if(!success)
		throw new Error(plugins.rawSQL.getException().getMessage());
	
	return true;
}

/**
 * @param {String} [timings] the cron timings
 * 
 * @properties={typeid:24,uuid:"E1103FC0-EF6F-4A48-957D-3234C11F8819"}
 */
function startCheckForExpiredRequests(timings)
{
	var jobName = 'check_for_expired_requests';
	var startDate = new Date();
		startDate.setSeconds(startDate.getSeconds() + 10);
		
	application.output('checking expired requests: starting new job at ' + startDate, LOGGINGLEVEL.INFO);
		
	plugins.scheduler.removeJob(jobName);
	if(timings)
		plugins.scheduler.addCronJob(jobName, timings, checkForExpiredRequests);
	else
		plugins.scheduler.addJob(jobName, startDate, checkForExpiredRequests, 0, 0);
}

/**
 * @properties={typeid:24,uuid:"74A1A06A-B972-49E1-AF92-1EFC03EB12A2"}
 */
function checkForExpiredRequests()
{
	var sqlQuery  = "SELECT DISTINCT idCliente FROM Ditte WHERE idCliente IS NOT NULL;"
	var dataset   = databaseManager.getDataSetByQuery(globals.Server.MA_ANAGRAFICHE, sqlQuery, null, -1);
	var companies = dataset.getColumnAsArray(1);
	
	var expiredRequests = [];
	for(var c = companies.length - 1; c >= 0; c--)
		expiredRequests = expiredRequests.concat(globals.findExpiredRequests(companies[c]));
	
	if(expiredRequests.length > 0)
	{
		// Update all expired requests, then refresh cached data
		globals.updateRequestStatus(expiredRequests, globals.RequestStatus.EXPIRED);
		
		var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);	
		
		fs.addFoundSetFilterParam('idlavoratorerichiesta', globals.ComparisonOperator.IN, expiredRequests);
		fs.loadAllRecords();
		for(var r = 1; r <= fs.getSize(); r++)
			refreshRecords(fs, r);
	}
}

/**
 * @properties={typeid:24,uuid:"ECB0AF87-6D99-426B-ACF1-452C60D71871"}
 */
function startCheckForUpdatedRequests(timings)
{
	application.output('checking updated requests: starting new job at ' + new Date(), LOGGINGLEVEL.INFO);
	
	var jobName   = 'check_updated_requests_job';
	plugins.scheduler.removeJob(jobName);
	plugins.scheduler.addCronJob(jobName, timings, checkForUpdatedRequests);
}

/**
 * @properties={typeid:24,uuid:"25D8FB60-8263-4FD4-8F52-B0E47E89411D"}
 * @AllowToRunInFind
 */
function checkForUpdatedRequests()
{
	var fs = getUpdatedRequestsFoundSet();
	
	var success = true;
	for(var r = 1; r <= fs.getSize() && success; r++)
	{
		var record = fs.getRecord(r);
		
		success = refreshRecords(fs, r);
		if(success)
			record['aggiornatosede'] = globals.FALSE;
		else
			application.output('Errore durante l\'aggiornamento della richiesta, id ' + record['idlavoratorerichiesta'], LOGGINGLEVEL.WARNING);
	}
}

/**
 * @return {JSFoundset}
 * 
 * @properties={typeid:24,uuid:"5BA2FA06-3223-4ABB-B3E7-6F07CD53C805"}
 */
function getUpdatedRequestsFoundSet()
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
	
	fs.addFoundSetFilterParam('aggiornatosede', globals.ComparisonOperator.EQ, globals.TRUE);
	fs.loadAllRecords();
	
	return fs;
}

/**
 * Returns true if the provided requests was updated at the hq, false otherwise
 * 
 * @return {Boolean}
 * 
 * @properties={typeid:24,uuid:"32D8742F-3054-4FEA-B65F-12AFC0DF899C"}
 * @AllowToRunInFind
 */
function isUpdated(requestid, checkRemotely)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
		
	if(!fs.loadRecords(requestid))
		throw globals.ma_utl_getDatabaseErrors()[0];
	
	// Update stale data just in case
	databaseManager.refreshRecordFromDatabase(fs, 0);
	
	if(fs && fs.find())
	{
		fs.idlavoratorerichiesta = requestid;
		fs.aggiornatosede = globals.TRUE;
		
		var updated = fs.search() > 0;
	}
	else
		throw new Error('isUpdated: error entering find mode');
	
	if(globals.ma_utl_isNullOrUndefined(updated))
		throw new Error('isUpdated: Errore durante la richiesta');
	
	if(!updated && checkRemotely)
	{
		var sqlQuery = "SELECT * FROM OPENQUERY([" + globals.LinkedServer.SRV_SEDE + "], 'SELECT [" + globals.Server.MA_RICHIESTE + "].[dbo].[F_RichiestaAggiornata](" + requestid + ");');";
		var dataset  = databaseManager.getDataSetByQuery(globals.Server.MA_RICHIESTE, sqlQuery, null, 1);
		
		updated = dataset && dataset.getValue(1,1) === globals.TRUE;
		
		if(globals.ma_utl_isNullOrUndefined(updated))
			throw new Error('isUpdated: Errore durante la richiesta');
	}
	
	return updated;
}

/**
 * @AllowToRunInFind
 * 
 * @return {Array}
 * 
 * @properties={typeid:24,uuid:"E4FE1E06-CE20-437E-84E9-B8E18DD41E5A"}
 */
function getDisabledRules(companyid, employeesid, periodo)
{
	/** @type {JSFoundSet<db:/ma_richieste/lavoratori_richieste>} */
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE, globals.Table.LAVORATORI_RICHIESTE);
	if (fs && fs.find())
	{
		// Ignore canceled requests and rectifications
		fs.status_code  = globals.ComparisonOperator.NE + globals.RequestStatus.CANCELED;
		fs.rettificaper = '^||=0';
		
		if(globals.isCliente())
			employeesid = employeesid.map(function(id){ return globals.ma_utl_lav_convertId(id); });
		
		if(!globals.ma_utl_hasKeySede())
			fs.owner_id			   = globals.svy_sec_lgn_owner_id;
		
		fs.idditta                 = globals.ma_utl_ditta_toSede(companyid);
		fs.idlavoratore			   = employeesid
		fs.periodocedolino 		   = periodo;
		fs.lavoratori_richieste_to_tab_richiestedettaglio
		  .ammettemolteplicita     = 0;
		
		fs.search();
	}
	
	return globals.foundsetToArray(fs, 'lavoratori_richieste_to_tab_richiestedettagliocondizioni.idtabrichiestadettagliocondizione');
}

/**
 * @AllowToRunInFind
 * 
 * @param {String} status_code see <strong>globals.RequestStatus</strong>
 *
 * @properties={typeid:24,uuid:"30A93EAA-AF19-43E0-9A30-3CD9B763B74B"}
 */
function getStatusId(status_code)
{
	var fs = datasources.db.ma_richieste.tab_statooperazioni.getFoundSet();
	if (fs && fs.find())
	{
		fs.codice = status_code;
		fs.search();
		
		return fs.idtabstatooperazione;
	}
	
	return null;
}

/**
 * @AllowToRunInFind
 * 
 * @param {Number} status_id
 *
 * @properties={typeid:24,uuid:"4A4070DF-7D84-41C1-BD11-262D995CD809"}
 */
function getStatusCode(status_id)
{
	var fs = datasources.db.ma_richieste.tab_statooperazioni.getFoundSet();
	if (fs && fs.find())
	{
		fs.idtabstatooperazione = status_id;
		fs.search();
		
		return fs.codice;
	}
	
	return null;
}

