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
	BASE       : 'Request32',
	FORM       : 'Form32',
	FILTER     : 'Filter32'
};

/**
 * @properties={typeid:35,uuid:"E691E42C-9569-4A97-8F37-97841F565755",variableType:-4}
 */
var PV_Type = 
{
	LAVORATORE : 0,
	VOCE : 1
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
 * @return {Array<Number>}
 *
 * @properties={typeid:24,uuid:"CCB9FA4B-3D61-442D-B9FD-76D09F9209E1"}
 */
function getAvailableEmployees(ruleID, companyID, periodo, gruppolavoratori)
{
	var params =
	{
		userid              : security.getUserName(), 
		clientid            : security.getClientID(),
		server              : globals.server_db_name,
		databasecliente     : globals.customer_dbserver_name,
		tipoconnessione		: globals.getTipoConnessione(),
		idditta				: companyID,
		ruleid				: ruleID,
		periodo				: periodo,
		workersgroup	    : gruppolavoratori
	}
		
	var url = [globals.WS_PV, globals.PV_Controllers.FILTER, 'FilterWorkersByRule'].join('/');
	var response = globals.getWebServiceWorkerResponse(url, params);
	return response && response.StatusCode == HTTPStatusCode.OK ? response.WorkerIds : [];
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
 * @return {{ RulesPerRequest, Rules, RulesSpecification }} 
 * 
 * @properties={typeid:24,uuid:"6C1AF326-F974-4D6C-A91F-03C699B983FA"}
 */
function getAvailableRequestsWithRules(companyID, employeeID, periodo, categoryID, gruppolavoratori)
{
	var url    = [globals.WS_PV, globals.PV_Controllers.FILTER, 'FilterWorkersRequestsByRule'].join('/');
	var params =
	{
		userid                  : security.getUserName(), 
		clientid                : security.getClientID(),
		server                  : globals.server_db_name,
		databasecliente         : globals.customer_dbserver_name,
		tipoconnessione	        : globals.getTipoConnessione(),
		idditta			        : companyID,
		idgruppoinstallazione   : getGruppoInstallazioneDitta(companyID),
		iddipendenti		    : [employeeID],
		idlavoratore            : employeeID,
		periodo			        : periodo,
		cathegoryid		        : categoryID,
		workersgroup            : gruppolavoratori
	}
	var response = globals.getWebServiceVariationResponse(url, params);
	if (response)
		return response;
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
	var url 	 = [globals.WS_PV, PV_Controllers.FORM, 'Build'].join('/');
	/** @type {{Fields : Object}} */
	var response =  globals.getWebServiceResponse(url, params);

	return response && response.Fields;
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
		/** @type {{ DataProvider: String, Mandatory: Boolean, Relation: String, ContentDataProvider : String, Name : String, Enabled : Boolean, Visible : Boolean }} */
		var field = specification[f];
		
		// Exclude hidden or disabled fields 
		if (field.Mandatory && field.Enabled && field.Visible)
		{
			var dataProvider = field.DataProvider;
			
			if(field.Relation)
			{
				var relObject = plugins.serialize.fromJSON(field.Relation);
				if (relObject)
					dataProvider = params.datasource + '_' + relObject.name + '.' + field.ContentDataProvider;
			}
			
			requiredFieldsProgram.required_fields[dataProvider] =
			{
				  db_status		: 'R'
				, req_by_prog	: true
				, form_status	: 'R'
				, on_form		: true	// needed for the check to work even if the form has not yet been shown
				, original_dp   : field.DataProvider
				, field_name	: field.Name
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
		fs.codice = field.Code;
		
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
		fs.tab_richiestedettagliocampi_valoriadipendente_to_tab_richiestedettagliocampi.codice = field.Code;
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
		{
			if(globals.ma_utl_hasKey(globals.Key.PANNELLO_VARIAZIONI_FILTRO_UTENTE))
				   fs.richiesta_utente = globals.getUserName(globals.svy_sec_lgn_user_id);
			
			fs.owner_id			   = globals.svy_sec_lgn_owner_id;
		}
		
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

/**
 * @AllowToRunInFind
 * 
 * @param idLavoratore
 * @param idTabRichiestaDettaglio
 * @param periodo
 * 
 * @return {JSRecord<db:/ma_richieste/lavoratori_richieste>}
 * 
 * @properties={typeid:24,uuid:"FFCDEA90-3825-445D-8D05-6E43FE13AF19"}
 */
function getEmployeeRequest(idLavoratore, idTabRichiestaDettaglio, periodo)
{
	var fs = datasources.db.ma_richieste.lavoratori_richieste.getFoundSet();
	if(fs && fs.find())
	{
		fs.idlavoratore = globals.convert_LavoratoriCliente2Sede(idLavoratore);
		fs.idtabrichiestadettaglio = idTabRichiestaDettaglio;
		fs.periodocedolino = periodo;
		
		fs.search();
		
		return fs.getRecord(1);
	}
	
	return null;
}

/**
 * @param {Number} idDitta
 * @param {Number} periodo
 * @param {Number} idWelfareDittaTracciato
 * @param {Number} idWelfareTipoPiano
 * @param {Number} annoContabile
 * @param {String} fileId
 * @param {Array<Number>} [arrIdLavoratoriRichiesteDaEscludere]
 *
 * @properties={typeid:24,uuid:"DEE406CA-60AD-4B2D-AE8D-5B49F2E93111"}
 */
function inizializzaParametriFileTracciatoWelfareImportazione(idDitta,periodo,idWelfareDittaTracciato,idWelfareTipoPiano,
	                                                          annoContabile,fileId,arrIdLavoratoriRichiesteDaEscludere)
{
	var objParams = 
	{
		userid                  : security.getUserName(), 
		clientid                : security.getClientID(),
		server                  : globals.server_db_name,
		databasecliente         : globals.customer_dbserver_name,
		idditta 				: idDitta,
		idgruppoinstallazione   : globals.getGruppoInstallazioneDitta(idDitta),
		codiceditta 			: globals.getCodDitta(idDitta),
		iddipendenti 			: [-1],
		periodo 				: periodo,
		idwelfaredittatracciato : idWelfareDittaTracciato,
		idwelfaretipopiano      : idWelfareTipoPiano,
		annocontabile           : annoContabile,
		fileid                  : fileId,
		username                : globals.getUserName(user_id),
		ownerid                 : owner_id		
   }
   
   if(arrIdLavoratoriRichiesteDaEscludere && arrIdLavoratoriRichiesteDaEscludere.length)
      objParams.idlavoratoririchieste = arrIdLavoratoriRichiesteDaEscludere;

	return objParams; 
}

/**
 * Lancia l'operazione lunga di acquisizione delle voci monetarie da un file tracciato esterno
 * 
 * @param {Number} idDitta
 * @param {Number} periodo
 * @param {Number} idWelfareDittaTracciato
 * @param {Number} idWelfareTipoPiano
 * @param {Number} annoContabile
 * @param {String} fileId
 * @param {Array<Number>} [arrIdLavoratoriRichiesteDaEscludere]
 *
 * @properties={typeid:24,uuid:"117B4E73-ECA7-436A-A6F1-F05819ED65AF"}
 */
function importaTracciatoWelfareDaFileEsterno(idDitta,periodo,idWelfareDittaTracciato,idWelfareTipoPiano,
	                                          annoContabile,fileId, arrIdLavoratoriRichiesteDaEscludere)
{
	// formattazione array per metodo vb6 con indice che parte da 1
	var arrIdLavoratoriRichiesteDaEscludereFormat = [];
	if(arrIdLavoratoriRichiesteDaEscludere && arrIdLavoratoriRichiesteDaEscludere.length) 
	{
		arrIdLavoratoriRichiesteDaEscludereFormat.push(-1);
		for(var i = 0; i < arrIdLavoratoriRichiesteDaEscludere.length; i++)
			arrIdLavoratoriRichiesteDaEscludereFormat.push(arrIdLavoratoriRichiesteDaEscludere[i]);
	}
															
	// chiamata al metodo del web service per l'acquisizione del tracciato dalla lettura del file caricato
	var params = globals.inizializzaParametriFileTracciatoWelfareImportazione(globals.ma_utl_ditta_cliente2Sede(idDitta),
							                                                  periodo,
																			  idWelfareDittaTracciato,
																			  idWelfareTipoPiano,
																			  annoContabile,
																			  fileId,
																			  arrIdLavoratoriRichiesteDaEscludereFormat);
	
	var op_values = {
					 op_ditta : idDitta,
					 op_progress : 5,
					 op_periodo : periodo,
					 op_message : 'Preparazione della chiamata di acquisizione...' 
					 };
	
	var op = scopes.operation.getNewOperation('ITW',op_values);
	params.operationid = op.op_id;
	var url = globals.WS_CALENDAR + "/Welfare32/ImportaTracciatoWelfareAsync";

	globals.addJsonWebServiceJob(url,params,vUpdateOperationStatusFunction);
}

/**
 * TODO generated, please specify type and doc for the params
 * @param idDitta
 * @param periodo
 * @param idWelfareDittaTracciato
 * @param idWelfareTipoPiano
 * @param annoContabile
 * @param fileId
 *
 * @properties={typeid:24,uuid:"BA69D797-B31A-4C4C-986F-1C4664C5BD09"}
 */
function checkTracciatoWelfareDaFileEsterno(idDitta,periodo,idWelfareDittaTracciato,idWelfareTipoPiano,annoContabile,fileId)
{
	// chiamata al metodo del web service per la verifica di voci del tracciato già presenti nello storico
	var params = globals.inizializzaParametriFileTracciatoWelfareImportazione(globals.ma_utl_ditta_cliente2Sede(idDitta),
							                                                  periodo,
																			  idWelfareDittaTracciato,
																			  idWelfareTipoPiano,
																			  annoContabile,
																			  fileId);
	
	var url = globals.WS_CALENDAR + "/Welfare32/CheckTracciatoWelfare";
	
	var response = globals.getWebServiceResponse(url,params);
	
	return response;
}

/**
 * Create a servoy JSForm from the provided specification. This must be an object
 * containing a number of properties equal to the number of the fields in the form.
 * <p>
 * Each field has in turn the following, fixed, structure<br/>
 * <code>{ code: String, name: String, format: String, size: Number, lines: Number, enabled: Boolean, visible: Boolean, order: Number, group: Number, type: String, [dataprovider]: String }</code>
 * </p>
 * @param 			specification
 * @param {Number} 	type				the type of the form, as defined in SM_VIEW. Accepted types are record (locked or not) and locked table
 * @param {String}	[formName]
 * @param {String} 	[extendsForm]
 * @param {String}  [dataSource]
 * @param {
 * 			{
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number, 
 * 		  	}
 * 		  }			[layoutParams]
 * @param {String} [requestType]  
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"B2DB38FF-77E6-4B93-B74D-178B6A228991"}
 */
function buildForm(specification, type, formName, extendsForm, dataSource, layoutParams, requestType)
{
	switch(type)
	{
		case JSForm.RECORD_VIEW:
		case JSForm.LOCKED_RECORD_VIEW:
			return buildDetailForm(specification, layoutParams, formName, extendsForm, dataSource, requestType);
			break;
			
		case JSForm.LOCKED_TABLE_VIEW:
			return buildTableForm(specification, layoutParams, formName, extendsForm, dataSource);
			break;
			
		default:
			throw 'Form type ' + type + ' not recognized';
	}
}

/**
 * Create a servoy JSForm from the provided specification. This must be an object
 * containing a number of properties equal to the number of the fields in the form.
 * <p>
 * Each field has in turn the following, fixed, structure<br/>
 * <code>{ code: String, name: String, format: String, size: Number, lines: Number, enabled: Boolean, visible: Boolean, order: Number, group: Number, type: String, [dataprovider]: String }</code>
 * </p>
 * @param 			specification
 * @param {Number} 	type				the type of the form, as defined in SM_VIEW. Accepted types are record (locked or not) and locked table
 * @param {String}	[formName]
 * @param {String} 	[extendsForm]
 * @param {String}  [dataSource]
 * @param {
 * 			{
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number, 
 * 		  	}
 * 		  }			[layoutParams]
 * @param [params]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"CCDCDED9-40AE-4FD4-A52A-9D1CE3973E5D"}
 */
function buildFormDetail(specification, type, formName, extendsForm, dataSource, layoutParams, params)
{
	switch(type)
	{
		case JSForm.RECORD_VIEW:
		case JSForm.LOCKED_RECORD_VIEW:
			return buildDetailFormDays(specification, layoutParams, formName, extendsForm, dataSource, params);
			break;
			
		case JSForm.LOCKED_TABLE_VIEW:
			return buildTableForm(specification, layoutParams, formName, extendsForm, dataSource);
			break;
			
		default:
			throw 'Form type ' + type + ' not recognized';
	}
}

/**
 * @param {Object} specification
 * @param {
 * 			{
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number, 
 * 			}
 * 		  } [layoutParams]
 * @param {String} [formName]
 * @param {String} [extendsForm]
 * @param {String} [dataSource]
 * @param {String} [requestType]
 * 
 * @properties={typeid:24,uuid:"A94369AB-19A1-4FD6-A7FA-3CDF20571895"}
 */
function buildDetailForm(specification, layoutParams, formName, extendsForm, dataSource, requestType)
{
	if(!specification || !dataSource)
		return null;
	
	if(!layoutParams)
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
	
	var jsForm = solutionModel.newForm(formName, solutionModel.getForm(extendsForm));
	
		jsForm.navigator   = SM_DEFAULTS.NONE;
		jsForm.view 	   = JSForm.RECORD_VIEW;
		jsForm.transparent = false;

	/**
	 * The form's coordinates, top-left based
	 */
	var x, y;
	
	/**
	 * Add any previous element to the tab sequence
	 */
	var maxTabSequence = forms[extendsForm].controller.getTabSequence().length;
	
	if(layoutParams.topMargin === null || layoutParams.topMargin === undefined)
		layoutParams.topMargin = jsForm.getBodyPart().height;

	y = layoutParams.topMargin;
		
	if(layoutParams.sideMargin === null || layoutParams.sideMargin === undefined)
		layoutParams.sideMargin = jsForm.width;

	x = layoutParams.sideMargin;
	
	// The first row must always be numbered 1
	var lastGroup = 1;
	var formWidth = jsForm.width;
		
	for(var f in specification)
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
		
		var fieldStyle 	   = 'default';
		var fieldAlignment = SM_ALIGNMENT.CENTER;
		var fieldValidator = null;
		var transparent;
				
		/**
		 * Add the field to the form according to its type
		 */
		var fieldType = JSField.TEXT_FIELD;
		switch(field.Type)
		{
			case globals.FieldType.BOOLEAN:
				fieldType 		 = JSField.CHECKS;
				fieldStyle 		 = 'check';
				fieldAlignment 	 = SM_ALIGNMENT.CENTER;
				transparent 	 = true;
				break;
			
			case globals.FieldType.STRING:
				fieldType 		 = JSField.TEXT_FIELD;
				fieldStyle 		 = 'default';
				fieldAlignment 	 = SM_ALIGNMENT.CENTER;
				transparent 	 = false;
				break;
				
			case globals.FieldType.DATETIME:
				fieldType 		 = JSField.TEXT_FIELD;
				fieldStyle 		 = 'default';
				fieldAlignment 	 = SM_ALIGNMENT.CENTER;
				transparent 	 = false;
				break;
				
			case globals.FieldType.INTEGER:
				fieldType 		 = JSField.TEXT_FIELD;
				fieldStyle 		 = 'default';
				fieldAlignment 	 = SM_ALIGNMENT.CENTER;
				transparent 	 = false;
				break;
				
			case globals.FieldType.NUMBER:
				fieldType 		 = JSField.TEXT_FIELD;
				fieldStyle 		 = 'default';
				fieldAlignment 	 = SM_ALIGNMENT.CENTER;
				
				if(field.Regex)
					fieldValidator = jsForm.newMethod
					(
						"function validate_" + field.DataProvider + "(oldValue, newValue, event)\
						 {\
						 	var regex = /" + field.Regex + "/;\
						 	if(newValue && newValue > 0 && regex.test(newValue))\
						 	{\
						 		setStatusWarning('Formato non valido');\
						 		return false;\
						 	}\
						 	else\
						 	{\
						 		resetStatus();\
						 		return true;\
						 	}\
						 }"
					);
				else
					fieldValidator = jsForm.getMethod('validateField');

				transparent 	 = false;
				break;
			
			case globals.FieldType.TEXT:
				fieldType 		= JSField.TEXT_AREA;
				fieldStyle 		= 'default';
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				transparent 	= false;
				break;
			
			case globals.FieldType.TRISTATE:
				fieldType 		= JSField.COMBOBOX;
				fieldStyle 		= 'default';
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				transparent 	= false;
				break;
				
			default:
				throw 'Field type ' + field.Type + ' not recognized';
		}
		
		// Add fields to the current row until they belong to the same group, otherwise start a new row
		if(field.Group !== lastGroup)
		{
			x  = layoutParams.sideMargin;
			y += layoutParams.labelHeight + layoutParams.fieldHeight + layoutParams.rowSpacing;
			
			lastGroup = field.Group;
		}
		
		// Add the field. Don't create it if already present
		var formField = jsForm.getField('fld_' + field.DataProvider);
		if(!formField)
		{
			formField = jsForm.newField(null, fieldType, x, y + layoutParams.labelHeight, field.Size, field.Lines * layoutParams.fieldHeight);
			
			// Move coordinates to the next field
			x += field.Size + layoutParams.fieldSpacing;
		}
		
		formField.dataProviderID        = field.DataProvider;
		formField.name 					= 'fld_' + field.DataProvider;
		formField.format				= field.Format;
		formField.displayType 			= fieldType;
		formField.horizontalAlignment 	= fieldAlignment;
		formField.toolTipText			= field.Tooltip;
		formField.transparent 			= transparent;
		formField.styleClass 			= fieldStyle;
		formField.enabled			    = 
		formField.editable				= (field.Enabled && !field.DependsOn) //|| field.hasdefault;
		formField.visible 				= field.Visible;
		formField.anchors 				= SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
		formField.displaysTags			= true;
		
		if(formField.editable)
			formField.tabSeq = maxTabSequence++;
		else
			formField.tabSeq = SM_DEFAULTS.IGNORE;
		
		// onDataChange validator
		if(fieldValidator)
			formField.onDataChange		= fieldValidator;
			
		if(field.OnAction)
		{
			var method = jsForm.getMethod(field.OnAction.name)
			if(!method)
				method = jsForm.newMethod(field.OnAction.code);
			
			formField.onAction = method; 
		}
			
		// The field is related
		if(field.Relation)
		{
			var relObject = plugins.serialize.fromJSON(field.Relation);
			if (relObject)
				formField.dataProviderID = dataSource + '_' + relObject.name + '.' + field.ContentDataProvider;
		}
		
		// Add a lookup if required
		if (field.Enabled && field.LookupParams)
		{
			var lkpBtn 				  = addLookup(field, formField, jsForm, layoutParams);
				lkpBtn.labelFor		  = formField.name;
				lkpBtn.styleClass	  = 'HideIfReadOnly';
		}
		
		// Add the label
		var fieldLabel 			   = jsForm.newLabel(field.Name, formField.x, y, field.Size, layoutParams.labelHeight);
			fieldLabel.name        = 'lbl_' + field.DataProvider;
			fieldLabel.transparent = true;
			fieldLabel.labelFor    = formField.name;
			
		// Add the 'overwrite default value' checkbox
		if(field.HasDefault)
		{
			var checkName      = 'chk_setdefault_' + field.DataProvider;
			var overwriteCheck = jsForm.getField(checkName);
			
			if(!overwriteCheck)
				overwriteCheck = jsForm.newCheck(field.DataProvider + '_setdefault', formField.x + formField.width - 22, formField.y, 20, 20);
			
			overwriteCheck.name			  	   = checkName
			overwriteCheck.anchors	     	   = SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
			overwriteCheck.transparent	  	   = true;
			overwriteCheck.styleClass     	   = 'check';
			overwriteCheck.horizontalAlignment = SM_ALIGNMENT.CENTER;
			overwriteCheck.dataProviderID 	   = field.DataProvider + '_setdefault';
			overwriteCheck.displaysTags   	   = true;
			overwriteCheck.toolTipText    	   = '%%i18n:ma.pv.lbl.overwrite_default%%';
			overwriteCheck.tabSeq		  	   = formField.tabSeq + 1; maxTabSequence++;
			overwriteCheck.onRender			   = jsForm.getMethod('onOverwriteDefaultRender');
			overwriteCheck.enabled			   = false;
			
			// Move coordinates to the next field
			x += field.Size + layoutParams.fieldSpacing;
		}
	}
	
	var isMonetary = requestType == null || requestType == globals.CategoriaRichiesta.MONETARIA;
	if(isMonetary)
	{
		// add the check field for the detail by day of request
		var chkField = jsForm.newCheck(null,x, y + layoutParams.labelHeight, field.Size, field.Lines * layoutParams.fieldHeight);
		chkField.dataProviderID = 'dettaglio';		
		chkField.name = 'chk_dettaglio_giorni';
		chkField.anchors = SM_ANCHOR.WEST;
		chkField.transparent = true;
		chkField.styleClass = 'check';
		chkField.horizontalAlignment = SM_ALIGNMENT.CENTER;
		chkField.tabSeq		  	   = formField.tabSeq + 1; maxTabSequence++;
		chkField.enabled = true;
		chkField.onDataChange = solutionModel.getGlobalMethod('globals', 'onDataChangeDettaglioGiorni');
		
		var chkLabel = jsForm.newLabel('Dettaglio giorni', x, y, field.Size, field.Lines * layoutParams.fieldHeight);
		chkLabel.name = 'lbl_dettaglio_giorni';
		chkLabel.transparent = true;
		chkLabel.labelFor = chkField.name;
		chkLabel.horizontalAlignment = SM_ALIGNMENT.CENTER;
		
		// Move coordinates to the next field
		x += chkLabel.width + layoutParams.fieldSpacing;
	}
	
	if(globals.ma_utl_hasKey(globals.Key.PANNELLO_VARIAZIONI_UTENTE))
	{
		// add the check field for the detail by day of request
		var chkFieldTerm = jsForm.newCheck(null,x, y + layoutParams.labelHeight, field.Size, field.Lines * layoutParams.fieldHeight);
		chkFieldTerm.dataProviderID = 'terminato';
		
		chkFieldTerm.name = 'chk_terminato';
		chkFieldTerm.anchors = SM_ANCHOR.WEST;
		chkFieldTerm.transparent = true;
		chkFieldTerm.styleClass = 'check';
		chkFieldTerm.horizontalAlignment = SM_ALIGNMENT.CENTER;
		chkFieldTerm.tabSeq		  	   = formField.tabSeq + 1; maxTabSequence++;
		chkFieldTerm.enabled = true;
		chkFieldTerm.editable = true;
		
		
		var chkLabelTerm = jsForm.newLabel('Terminato', x, y, field.Size, field.Lines * layoutParams.fieldHeight);
		chkLabelTerm.name = 'lbl_terminato_giorni';
		chkLabelTerm.transparent = true;
		chkLabelTerm.labelFor = chkFieldTerm.name;
		chkLabelTerm.horizontalAlignment = SM_ALIGNMENT.CENTER;
		
		// Move coordinates to the next field
		x += chkLabelTerm.width + layoutParams.fieldSpacing;	
	}
	
	// nel caso di form di inserimento, disegniamo anche il pulsante per accedere alla fase di dettaglio
	if(utils.stringRight(formName,5) == '_edit' && isMonetary)
	{		
		// add the button for opening the per-day-management of current request
		var btnLabel = jsForm.newLabel('', x, y + layoutParams.labelHeight, 20, 20);
		btnLabel.name = 'btn_dettaglio_giorni';
		btnLabel.styleClass = 'btn_add';
		btnLabel.enabled = false;
		btnLabel.showClick = false;
		btnLabel.showFocus = true;
		btnLabel.toolTipText = 'Vai alla gestione puntuale della richiesta sui singoli giorni';
		btnLabel.onAction = solutionModel.getGlobalMethod('globals','onActionBtnDettaglioGiorni');	
	}
		
	if(x > formWidth)
		formWidth = x;
	
	jsForm.width = formWidth;
	jsForm.getBodyPart().height = y + layoutParams.labelHeight + layoutParams.fieldHeight + layoutParams.bottomMargin;
	
	return jsForm;
}

/**
 * @param {Object} specification
 * @param {
 * 			{
 * 				sideMargin		: Number, 
 * 				topMargin		: Number,
 * 				bottomMargin	: Number, 
 * 				fieldHeight		: Number, 
 * 				fieldSpacing	: Number, 
 * 				rowSpacing		: Number, 
 * 				labelHeight		: Number, 
 * 			}
 * 		  } [layoutParams]
 * @param {String} [formName]
 * @param {String} [extendsForm]
 * @param {String} [dataSource]
 * @param {Object} [params]
 * 
 * @properties={typeid:24,uuid:"090290DC-077C-487E-BC70-952BF286658A"}
 */
function buildDetailFormDays(specification, layoutParams, formName, extendsForm, dataSource, params)
{
	if(!specification || !dataSource)
		return null;
	
	if(!layoutParams)
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
	
	if(solutionModel.getForm(formName))
	{
		history.removeForm(formName);
		solutionModel.removeForm(formName);
	}
		
	var jsForm = solutionModel.newForm(formName, solutionModel.getForm(extendsForm));
	
		jsForm.navigator   = SM_DEFAULTS.NONE;
		jsForm.view 	   = JSForm.RECORD_VIEW;
		jsForm.transparent = false;
			
	/**
	 * The form's coordinates, top-left based
	 */
	var x, y;
	
	/**
	 * Add any previous element to the tab sequence
	 */
	var maxTabSequence = forms[extendsForm].controller.getTabSequence().length;
	
	if(layoutParams.topMargin === null || layoutParams.topMargin === undefined)
		layoutParams.topMargin = jsForm.getBodyPart().height;

	y = layoutParams.topMargin;
		
	if(layoutParams.sideMargin === null || layoutParams.sideMargin === undefined)
		layoutParams.sideMargin = jsForm.width;

	x = layoutParams.sideMargin;
	
	// The first row must always be numbered 1
	var lastGroup = 1;
	var formWidth = jsForm.width;

	var firstDay = globals.getFirstDatePeriodo(params['periodo']);
	var daysNumber = globals.getTotGiorniMese(firstDay.getMonth() + 1,firstDay.getFullYear());
//    var requestFields = globals.getRequestFields(params['requestid']);
	
	for(var d = 1; d <= daysNumber; d++)
	{
		/** @type {Date}*/
		var day = new Date(firstDay.getFullYear(),firstDay.getMonth(),firstDay.getDate() + (d - 1));
		/** @type {String}*/
		var dayIso = globals.dateFormat(day,ISO_DATEFORMAT);
		
		// Add fields to the current row until they belong to the same group, otherwise start a new row
		if(d !== lastGroup)
		{
			x = layoutParams.sideMargin;
			y += layoutParams.fieldHeight + layoutParams.rowSpacing;
			
			lastGroup = d;
		}
		
		if(d == 1)
		   jsForm.newLabel('Giorno',layoutParams.sideMargin,y,60,layoutParams.labelHeight);
				
		var fldDayVariable = jsForm.newVariable('v' + dateFormat(day,ISO_DATEFORMAT),JSVariable.TEXT);
		fldDayVariable.defaultValue = "'" + scopes.date.GetDayName(day) + " " + day.getDate() + "'";
		var dayField = jsForm.newField(fldDayVariable.name,JSField.TEXT_FIELD,layoutParams.sideMargin,y + layoutParams.fieldHeight,60,layoutParams.fieldHeight);
		dayField.name 					= 'fld_day_' + dayIso;
		dayField.horizontalAlignment 	= SM_ALIGNMENT.CENTER;
		dayField.toolTipText			= 'Giorno ' + dateFormat(day,EU_DATEFORMAT);
		dayField.transparent 			= false;
		dayField.enabled			    = false;
		dayField.editable				= false;
		dayField.visible 				= true;
		dayField.anchors 				= SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
		dayField.displaysTags			= true;
		
		x = 60 + layoutParams.sideMargin + layoutParams.fieldSpacing;
		
		for(var f in specification)
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
			
			var fieldStyle 	   = 'default';
			var fieldAlignment = SM_ALIGNMENT.CENTER;
			var fieldValidator = null;
			var fieldDataChange = null;
			var transparent;
					
			/**
			 * Add the field to the form according to its type
			 */
			var fieldType = JSField.TEXT_FIELD;
			switch(field.Type)
			{
				case globals.FieldType.BOOLEAN:
					fieldType 		 = JSField.CHECKS;
					fieldStyle 		 = 'check';
					fieldAlignment 	 = SM_ALIGNMENT.CENTER;
					transparent 	 = true;
					break;
				
				case globals.FieldType.STRING:
					fieldType 		 = JSField.TEXT_FIELD;
					fieldStyle 		 = 'default';
					fieldAlignment 	 = SM_ALIGNMENT.CENTER;
					transparent 	 = false;
					break;
					
				case globals.FieldType.DATETIME:
					fieldType 		 = JSField.TEXT_FIELD;
					fieldStyle 		 = 'default';
					fieldAlignment 	 = SM_ALIGNMENT.CENTER;
					transparent 	 = false;
					break;
					
				case globals.FieldType.INTEGER:
					fieldType 		 = JSField.TEXT_FIELD;
					fieldStyle 		 = 'default';
					fieldAlignment 	 = SM_ALIGNMENT.CENTER;
					transparent 	 = false;
					break;
					
				case globals.FieldType.NUMBER:
					fieldType 		 = JSField.TEXT_FIELD;
					fieldStyle 		 = 'default';
					fieldAlignment 	 = SM_ALIGNMENT.CENTER;
					
					if(field.Regex)
						fieldValidator = jsForm.newMethod
						(
							"function validate_" + field.DataProvider + "(oldValue, newValue, event)\
							 {\
							 	var regex = /" + field.Regex + "/;\
							 	if(newValue && newValue > 0 && regex.test(newValue))\
							 	{\
							 		setStatusWarning('Formato non valido');\
							 		return false;\
							 	}\
							 	else\
							 	{\
							 		resetStatus();\
							 		return true;\
							 	}\
							 }"
						);
					else
						fieldValidator = jsForm.getMethod('validateFieldDetail');
	
					fieldDataChange = jsForm.getMethod('onDataChangeFieldDetail');
					
					transparent 	 = false;
					break;
				
				case globals.FieldType.TEXT:
					fieldType 		= JSField.TEXT_AREA;
					fieldStyle 		= 'default';
					fieldAlignment 	= SM_ALIGNMENT.CENTER;
					transparent 	= false;
					break;
				
				case globals.FieldType.TRISTATE:
					fieldType 		= JSField.COMBOBOX;
					fieldStyle 		= 'default';
					fieldAlignment 	= SM_ALIGNMENT.CENTER;
					transparent 	= false;
					break;
					
				default:
					throw 'Field type ' + field.Type + ' not recognized';
			}
						
			// for the first row, also add the labels
			if(d == 1)
			{
				// Add the label
				var fieldLabel 			   = jsForm.newLabel(field.Name, x, y, field.Size, layoutParams.labelHeight);
					fieldLabel.name        = 'lbl_' + field.DataProvider;
					fieldLabel.transparent = true;
			}
						
			// Add the field. Don't create it if already present
			var fldName = 'fld_' + field.DataProvider + '_' + dateFormat(day,ISO_DATEFORMAT);
			var formField = jsForm.getField(fldName);
			if(!formField)
			{
				formField = jsForm.newField(null, fieldType, x, y + layoutParams.labelHeight, field.Size, field.Lines * layoutParams.fieldHeight);
				
				// Move coordinates to the next field
				x += field.Size + layoutParams.fieldSpacing;
							
			}
				
			// verifica se esiste un valore precedentemente inserito
			var existingRecord = params['recordid'] ? getRichiestaCampoDettaglioCodice(params['recordid'],field.Code,dayIso) : params['recordid'];
			var defaultVarValue = ( existingRecord && existingRecord.valore) 
			                      || (field.Formula && !isNaN(utils.stringReplace(field.Formula,",",".")) ? utils.stringReplace(field.Formula,",",".") : null);
			
			var fldVariable = jsForm.newVariable('v_' + field.DataProvider + '_' + dateFormat(day,ISO_DATEFORMAT)
				                                 ,JSVariable.TEXT
												 ,defaultVarValue);
			
			formField.dataProviderID        = fldVariable.name;
			formField.name 					= fldName;
			//formField.format				= field.Format;
			formField.displayType 			= fieldType;
			formField.horizontalAlignment 	= fieldAlignment;
			formField.toolTipText			= field.Tooltip;
			formField.transparent 			= transparent;
			formField.styleClass 			= fieldStyle;
			formField.enabled			    = 
			formField.editable				= (field.Enabled && !field.DependsOn) //|| field.hasdefault;
			formField.visible 				= field.Visible;
			formField.anchors 				= SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
			formField.displaysTags			= true;
			
			if(formField.editable)
				formField.tabSeq = maxTabSequence++;
			else
				formField.tabSeq = SM_DEFAULTS.IGNORE;
			
			// onDataChange validator
			if(fieldValidator)
				formField.onFocusLost           = fieldValidator;
				//formField.onDataChange		= fieldValidator;
				formField.onDataChange          = fieldDataChange;
				
//			if(field.OnAction)
//			{
//				var method = jsForm.getMethod(field.OnAction.name)
//				if(!method)
//					method = jsForm.newMethod(field.OnAction.code);
//				
//				formField.onAction = method; 
//			}
				
			// The field is related
			if(field.Relation)
			{
				var relObject = plugins.serialize.fromJSON(field.Relation);
				if (relObject)
					formField.dataProviderID = dataSource + '_' + relObject.name + '.' + field.ContentDataProvider;
			}
			
			// Add a lookup if required
			if (field.Enabled && field.LookupParams)
			{
				var lkpBtn 				  = addLookup(field, formField, jsForm, layoutParams);
					lkpBtn.labelFor		  = formField.name;
					lkpBtn.styleClass	  = 'HideIfReadOnly';
			}
									
	//		if(x > formWidth)
	//			formWidth = x;
		}
	}
	
	// creazione totali campi richiesta
	x = 60 + layoutParams.sideMargin + layoutParams.fieldSpacing;
	y += (layoutParams.fieldHeight * 2) + layoutParams.rowSpacing;
			
	for(f in specification)
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
		var spec = specification[f];
		var lblTotale = jsForm.newLabel('Tot. ' + spec.DataProvider ,x , y ,spec.Size ,layoutParams.labelHeight)
		lblTotale.name = 'lbl_' + spec.DataProvider + '_tot';
		// Add the total field. Don't create it if already present
		var fldTotale = 'fld_' + spec.DataProvider + '_tot';
		var totField = jsForm.getField(fldTotale);
		if(!totField)
		{
			totField = jsForm.newField(null, JSField.TEXT_FIELD, x, y + layoutParams.labelHeight, spec.Size, layoutParams.fieldHeight);
			
			// Move coordinates to the next field
			x += spec.Size + layoutParams.fieldSpacing;
		}
		
		var defaultTotValue = spec.Formula && !isNaN(utils.stringReplace(spec.Formula,",",".")) ? utils.stringReplace(spec.Formula,",",".") : null;
		var fldTotVariable = jsForm.newVariable('v_' + spec.DataProvider + '_tot'
			                                    ,JSVariable.TEXT
												,defaultTotValue);
		
		totField.dataProviderID        = fldTotVariable.name;
		totField.name 				   = fldName;
		totField.styleClass            = 'default';
		totField.transparent           = false;
		totField.enabled               = false;
		totField.editable              = false;
		totField.horizontalAlignment   = SM_ALIGNMENT.CENTER;
		
		var defaultFormulaValue = spec.Formula ? spec.Formula.toString() : null;
		jsForm.newVariable('v_' + spec.DataProvider + '_formula'
			               ,JSVariable.TEXT
						   ,"'" + defaultFormulaValue + "'");
	}
	
	if(x > formWidth)
		formWidth = x;
	
	jsForm.width = formWidth;
	jsForm.getBodyPart().height = y + layoutParams.labelHeight + layoutParams.fieldHeight + layoutParams.bottomMargin;
	
	return jsForm;
}

/**
 * @param specification
 * @param {
 * 			{ 
 * 				fieldHeight		: Number, 
 * 				labelHeight		: Number, 
 * 				sideMargin		: Number,
 * 				bottomMargin	: Number
 * 			}
 * 		  } [layoutParams]
 * @param {String} [formName]
 * @param {String} [extendsForm]
 * @param {String} [dataSource]
 * 
 * @properties={typeid:24,uuid:"54774DBE-F07E-4884-80A1-BB4E50162818"}
 */
function buildTableForm(specification, layoutParams, formName, extendsForm, dataSource)
{
	if(!specification || !dataSource)
		return null;
	
	if(!layoutParams)
		layoutParams = 
		{ 
			  fieldHeight	: 20
			, labelHeight	: 20
			, bottomMargin	: 0
		}
	
	var jsForm = solutionModel.newForm(formName, solutionModel.getForm(extendsForm));
		
		jsForm.navigator = SM_DEFAULTS.NONE;
		jsForm.view = JSForm.LOCKED_TABLE_VIEW;
		jsForm.transparent = false;
		
	/**
	 * The form's coordinates, top-left based
	 */
	var x = layoutParams.sideMargin || jsForm.width, y = 0;
	
	/**
	 * Add any previous element to the tab sequence
	 */
	var maxTabSequence = forms[extendsForm].controller.getTabSequence().length;
	
	var formWidth = jsForm.width;
//	var formHeight = jsForm.getBodyPart().height + (jsForm.getFooterPart() && jsForm.getFooterPart().height);
	
	for(var f in specification)
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
		 *              OnRender : Boolean
		 * 			}
		 * 		} 
		 */
		var field = specification[f];
		
		var fieldAlignment = SM_ALIGNMENT.CENTER;
		var fieldValidator = null;
		
		/**
		 * Add the field to the form according to its type
		 */
		var displayType = JSField.TEXT_FIELD;
		switch(field.Type)
		{
			case globals.FieldType.BOOLEAN:
				displayType 	= JSField.CHECKS;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
			
			case globals.FieldType.STRING:
				displayType 	= JSField.TEXT_FIELD;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
				
			case globals.FieldType.DATETIME:
				displayType 	= JSField.TEXT_FIELD;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
				
			case globals.FieldType.INTEGER:
				displayType 	= JSField.TEXT_FIELD;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
				
			case globals.FieldType.NUMBER:
				displayType 	= JSField.TEXT_FIELD;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				
				if(field.Regex)
					fieldValidator = jsForm.newMethod
					(
						"function validate_" + field.DataProvider + "(oldValue, newValue, event)\
						 {\
						 	var regex = /" + field.Regex + "/;\
						 	if(newValue && newValue > 0 && regex.test(newValue))\
						 	{\
						 		setStatusWarning('Formato non valido');\
						 		return false;\
						 	}\
						 	else\
						 	{\
						 		resetStatus();\
						 		return true;\
						 	}\
						 }"
					);
				else
					fieldValidator = jsForm.getMethod('validateField');
				
				break;
			
			case globals.FieldType.TEXT:
				displayType 	= JSField.TEXT_AREA;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
			
			case globals.FieldType.TRISTATE:
				displayType 	= JSField.COMBOBOX;
				fieldAlignment 	= SM_ALIGNMENT.CENTER;
				break;
				
			default:
				throw 'Field type ' + field.Type + ' not recognized';
		}
		
		// Actually add the field. Don't create it if already present
		var formField = jsForm.getField('fld_' + field.DataProvider);
		if(!formField)
		{
			formField = jsForm.newField(null, displayType, x, y + layoutParams.labelHeight, field.Size, field.Lines * layoutParams.fieldHeight);
			
			// Move coordinates to the next field
			x += formField.width;
		}
		
		formField.dataProviderID 	  = field.DataProvider;
		formField.name 				  = 'fld_' + field.DataProvider;
		formField.format 			  = field.Format;
		formField.displayType 		  = displayType;
		formField.toolTipText		  = field.Tooltip;
		formField.horizontalAlignment = fieldAlignment;
		formField.enabled			  = 
		formField.editable			  = (field.Enabled && !field.DependsOn); // || field.hasdefault 
		formField.visible 			  = field.Visible;
		formField.anchors 			  = SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
		formField.styleClass 		  = 'table';
		formField.displaysTags		  = true;
		formField.transparent         = false;
		
		if(formField.editable)
			formField.tabSeq = maxTabSequence++;
		else
			formField.tabSeq = SM_DEFAULTS.IGNORE;
			
		if(fieldValidator && formField.editable)
			formField.onDataChange = fieldValidator;
			
		if(field.OnAction)
		{
			var method = jsForm.getMethod(field.OnAction.name)
			if(!method)
				method = jsForm.newMethod(field.OnAction.code);
			
			formField.onAction = method; 
		}
			
		// The field is related
		if(field.Relation)
		{
			var relObject = plugins.serialize.fromJSON(field.Relation);
			if (relObject)
				formField.dataProviderID = dataSource + '_' + relObject.name + '.' + field.ContentDataProvider;
		}
			
		// Add a lookup if required
		if (field.Enabled && field.LookupParams)
		{
			field.OnRender = false;
			
			var lkpBtn 			  = addLookup(field, formField, jsForm, layoutParams);
				lkpBtn.styleClass = 'table';
				
			// Add the label for the button
			var lkpLabel             = jsForm.newLabel(null, lkpBtn.x, lkpBtn.y, lkpBtn.width, layoutParams.labelHeight);
				lkpLabel.name 		 = 'lbl_' + lkpBtn.name;
				lkpLabel.anchors 	 = SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
				lkpLabel.styleClass  = 'table_header';
				lkpLabel.labelFor 	 = lkpBtn.name;
				lkpLabel.transparent = false;
				lkpLabel.tabSeq		 = SM_DEFAULTS.IGNORE;
				
			x += lkpBtn.width;
		}
			
		// Don't apply only if explicity requested
		if(field.OnRender !== false)
			formField.onRender = jsForm.getMethod('onFieldRender');
			
		// Add the label for the field
		var fieldLabel = jsForm.newLabel(field.Name, formField.x, y, field.Size, layoutParams.labelHeight);
			fieldLabel.name 		= 'lbl_' + field.DataProvider;
			fieldLabel.anchors 		= SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
			fieldLabel.styleClass  	= 'table_header';
			fieldLabel.labelFor 	= formField.name;
			fieldLabel.transparent 	= false;
			fieldLabel.tabSeq		= SM_DEFAULTS.IGNORE;
			
		// Add the 'overwrite default value' checkbox
		if(field.HasDefault)
		{
			var checkName = 'chk_setdefault_' + field.DataProvider;

			var overwriteCheck = jsForm.getField(checkName);
			if(!overwriteCheck)
			{
				overwriteCheck = jsForm.newCheck(null, formField.x + formField.width, formField.y, 20, 20);
				x += overwriteCheck.width;
			}
			
			overwriteCheck.dataProviderID      = field.DataProvider + '_setdefault';
			overwriteCheck.name			  	   = checkName
			overwriteCheck.anchors	     	   = SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
			overwriteCheck.transparent	  	   = true;
			overwriteCheck.horizontalAlignment = SM_ALIGNMENT.CENTER;
			overwriteCheck.displaysTags   	   = true;
			overwriteCheck.toolTipText    	   = '%%i18n:ma.pv.lbl.overwrite_default%%';
			overwriteCheck.onRender			   = jsForm.getMethod('onOverwriteDefaultRender');
			overwriteCheck.enabled			   = false;
			overwriteCheck.styleClass          = 'table';
			
			if(formField.enabled)
			{
				overwriteCheck.tabSeq = formField.tabSeq + 1; 
				maxTabSequence++;
			}
			else
				overwriteCheck.tabSeq = SM_DEFAULTS.IGNORE;		
			
			formField.styleClass  = 'table_no_side_border';
			fieldLabel.styleClass = 'table_header_no_side_border';
						
			var labelName      = 'lbl_setdefault_' + field.DataProvider;
			
			var overwriteLabel = jsForm.getLabel(labelName);
			if(!overwriteLabel)
				overwriteLabel = jsForm.newLabel(null, overwriteCheck.x, y, overwriteCheck.width, layoutParams.labelHeight);
			
			overwriteLabel.name 	   = labelName;
			overwriteLabel.anchors 	   = SM_ANCHOR.WEST | SM_ANCHOR.NORTH;
			overwriteLabel.styleClass  = 'table_header';
			overwriteLabel.labelFor    = overwriteCheck.name;
			overwriteLabel.transparent = false;
			overwriteLabel.tabSeq	   = SM_DEFAULTS.IGNORE;
		}
		
		if(x > formWidth)
			formWidth = x;
		
	}
	jsForm.width = formWidth;
	jsForm.getBodyPart().height = y + layoutParams.labelHeight + layoutParams.fieldHeight;
	
	return jsForm;
}

/**
 * @param 
		 * 			{{
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
		 * 			}}
		 *		field
 * @param {JSField} formField
 * @param {JSForm} 	jsForm
 * @param 			layoutParams
 * 
 * @properties={typeid:24,uuid:"1BF6141A-ACC3-4111-97B7-EA7BC147A523"}
 */
function addLookup(field, formField, jsForm, layoutParams)
{
	var lookupParams 						   = plugins.serialize.fromJSON(field.LookupParams);
		lookupParams.methodToAddFoundsetFilter = 'filterByQuery';
		lookupParams.returnField			   = field.DataProvider;
		
	if(lookupParams.afterUpdateFunction)
	{
		var afterUpdate = jsForm.newMethod(lookupParams.afterUpdateFunction);
		lookupParams.methodToExecuteAfterSelection = afterUpdate.getName();
	}
	
	if(field.FilterQuery)
		var filterQuery   = "'" + globals.ma_utl_replaceCatalogs(field.FilterQuery) + "'";
	
	if(field.FilterArgs)
	{
		/** @type {Array} */
		var filterArgs = plugins.serialize.fromJSON(field.FilterArgs);
			filterArgs = filterArgs.map(function(arg){ return { name: arg, type: globals.fieldTypeToJSColumn(field.Type) }; });
	}
	
	var lkpMethod   = solutionModel.wrapMethodWithArguments
						(
								  jsForm.getMethod('showLookup')
								, [null, lookupParams, filterQuery, filterArgs]
						);
						
	var lkpBtnWidth 		   		  = layoutParams.lookupButtonWidth || 20;
	var lkpBtn 				     	  = jsForm.newLabel(null, formField.x + formField.width - lkpBtnWidth, formField.y, lkpBtnWidth, lkpBtnWidth);
		lkpBtn.name			     	  = 'btn_' + field.DataProvider;
		lkpBtn.toolTipText       	  = 'Ricerca ' + field.Name;
		lkpBtn.onAction		     	  = lkpMethod;
		lkpBtn.imageMedia 	     	  = solutionModel.getMedia('magnifier-left.png');
		lkpBtn.transparent 	     	  = true;
		lkpBtn.showClick 	    	  = false;
		lkpBtn.rolloverCursor   	  = SM_CURSOR.HAND_CURSOR;
		lkpBtn.tabSeq				  = SM_DEFAULTS.IGNORE;
		
		formField.editable       	  = false;
		formField.horizontalAlignment = SM_ALIGNMENT.LEFT;
		
	return lkpBtn;
}

/**
 * Gestisce il cambio del valore per il caso del dettaglio su giorno o meno per la richiesta corrente 
 * 
 * @param oldValue
 * @param newValue
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"303B402D-54C3-4A9E-9CC1-5A078651950B"}
 */
function onDataChangeDettaglioGiorni(oldValue,newValue,event)
{
	//pulizia di eventuali valori dei campi compilabili e bloccare i campi o viceversa
	var frmName = event.getFormName();
	var frm = forms[frmName];
	var fs = frm.foundset;
		 
	// rollback di eventuali transazioni precedenti (specie se nuova variazione già compilata in dettaglio e modificata togliendo il dettaglio)
	if(databaseManager.getEditedRecords())
		databaseManager.rollbackTransaction();
	
	var specification = ['base','quantita','importo'];
	
	for(var f in specification)
	{
		var fldName = 'fld_' + specification[f];
		if(frm.elements[fldName])
		{
			frm.elements[fldName].enabled = !newValue;
		    if(frm.elements[fldName].editable)
		       	if(fs[specification[f]])
		    		fs[specification[f]] = null;		    
		}
	}
	
	frm.elements['btn_dettaglio_giorni'].enabled = newValue;
}

/**
 * @param {String} url
 * @param params
 *
 * @return {{ReturnValue: Object, StatusCode: Number, Message: String, RulesPerRequest : Object, Rules : Object, RulesSpecification : Object}}
 * 
 * @properties={typeid:24,uuid:"4D51DA1F-2AC6-4CD2-96F1-279FCEC74BED"}
 */
function getWebServiceVariationResponse(url,params)
{
	/** @type {{ReturnValue: Object, StatusCode: Number, Message: String, RulesPerRequest : Object, Rules : Object, RulesSpecification : Object}} */
	var response = globals.getWebServiceResponse(url,params);
	return response;
}

/**
 * @param {String} url
 * @param params
 *
 * @return {{ReturnValue: Object, StatusCode: Number, Message: String, RulesPerEmployee : Object, RulesSpecification : Object}}
 * 
 * @properties={typeid:24,uuid:"4A2A7F19-E99C-43B6-839C-DC16C65E8373"}
 */
function getWebServiceRuleVariationResponse(url,params)
{
	/** @type {{ReturnValue: Object, StatusCode: Number, Message: String, RulesPerEmployee : Object, RulesSpecification : Object}} */
	var response = globals.getWebServiceResponse(url,params);
	return response;
}

/**
 * @param {String} url
 * @param params
 *
 * @return {{ReturnValue: Object, StatusCode: Number, Message: String, Fields : Object}}
 * 
 * @properties={typeid:24,uuid:"05D6FD7B-0C91-4A18-AA3A-4F2B79059B1D"}
 */
function getWebServiceBuildResponse(url,params)
{
	/** @type {{ReturnValue: Object, StatusCode: Number, Message: String, Fields : Object}} */
	var response = globals.getWebServiceResponse(url,params);
	return response;
}

/**
 * @param {String} url
 * @param params
 *
 * @return {{ReturnValue: Object, StatusCode: Number, Message: String, WorkerIds : Array<Number>}}
 * 
 * @properties={typeid:24,uuid:"16286376-471E-4D16-816B-0C88EC48D07A"}
 */
function getWebServiceWorkerResponse(url,params)
{
	/** @type {{ReturnValue: Object, StatusCode: Number, Message: String, WorkerIds : Array<Number>}} */
	var response = globals.getWebServiceResponse(url,params);
	return response;
}