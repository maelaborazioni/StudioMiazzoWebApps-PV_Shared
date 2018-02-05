/**
 * @AllowToRunInFind
 * 
 * @param {Array<JSRecord<db:/ma_richieste/lavoratori_richieste>>} requests
 * @param {Function} [refreshJob]
 *
 * @properties={typeid:24,uuid:"99090DD1-238C-4053-98E0-1587DCC247F9"}
 */
function markRequestsAsSent(requests, refreshJob)
{
	try
	{
		var autoSave = databaseManager.getAutoSave();
		databaseManager.setAutoSave(false);
		
		databaseManager.startTransaction();
		
		var success = updateRequestsAsSent(requests) && updateRequestsAsCanceled(requests) && updateRequestsAsOverwritten(requests);
		if (success && databaseManager.commitTransaction())
		{
			if(refreshJob)
			{
				// Start a job to update the status bar
				var startDate = new Date();
					startDate.setMilliseconds(startDate.getMilliseconds()) + 1000;
				
				plugins.scheduler.removeJob('reload_job');
				plugins.scheduler.addJob('reload_job', startDate, refreshJob, 1e9, 0, startDate, null);
			}
			
			return true;
		}
		else
			return false;
	}
	catch(ex)
	{
		databaseManager.rollbackTransaction();
		globals.ma_utl_logError(ex);
		
		return false;
	}
	finally
	{
		databaseManager.setAutoSave(autoSave);
	}
}

/**
 * @properties={typeid:24,uuid:"4B358A15-A85F-4115-B113-82E5EB90EC95"}
 */
function updateRequestsAsSent(requests)
{
	/**
	 * If a request is rectified, send the rectification instead
	 */
	var requestsToUpdate = requests.map
	(
		function(req)
		{ 
			if(req.in_rettifica)
				return req.lavoratori_richieste_to_lavoratori_richieste_rettifiche.idlavoratorerichiesta;
			
			return req.idlavoratorerichiesta;
		}
	);
	
	return globals.updateRequestsAsSent(requestsToUpdate, new Date(), globals.svy_sec_username);
}

/**
 * @properties={typeid:24,uuid:"FE61BBB8-4F50-4661-AFC1-2076CA656975"}
 */
function updateRequestsAsCanceled(requests)
{
	/**
	 * Update all 'to cancel' requests to 'canceled'. Filter to prevent spurious data (better safe than sorry...)
	 */
	var requestsToCancel = requests.filter(function(req){ return req.in_annullamento;       })
								   .map   (function(req){ return req.idlavoratorerichiesta; });
		
	return globals.updateRequestStatus(requestsToCancel, globals.RequestStatus.CANCELED);
}

/**
 * @properties={typeid:24,uuid:"97B8F9C7-07BA-4BB4-80C1-F311E0A62E4B"}
 */
function updateRequestsAsOverwritten(requests)
{
	/**
	 * Update all 'to overwrite' requests to 'overwritten'
	 */
	var requestsToOverwrite = requests.filter(function(req){ return req.tiporettifica === globals.TipoRettifica.MODIFICA; })
									  .map   (function(req){ return req.idlavoratorerichiesta; 							  });
		
	return globals.updateRequestStatus(requestsToOverwrite, globals.RequestStatus.CANCELED);
}

/**
 * TODO generated, please specify type and doc for the params
 * @param requests
 *
 * @properties={typeid:24,uuid:"16D6B063-9FA5-4A74-A664-F07FC3BD4A91"}
 */
function updateRequestsAsTerminated(requests)
{
	/**
	 * Update all 'to terminate' requests to 'terminated'
	 */
	return globals.updateRequestTermination(requests);
}

/**
 * @AllowToRunInFind
 * 
 * @return {Array<JSRecord<db:/ma_richieste/lavoratori_richieste>>}
 * 
 * @properties={typeid:24,uuid:"7FA621AD-AFD6-472E-B73F-E56F7F5DD958"}
 */
function getRequestsToSend(idDitta)
{
	var arrRequestsToSend = [];
	
	/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>}*/
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,globals.Table.LAVORATORI_RICHIESTE);
	var ultimoCedolinoStampato = globals.ma_utl_getUltimoCedolinoStampato(idDitta);
	
	if(fs && fs.find())
	{
//		fs.lavoratori_richieste_to_lavoratori.idditta = idDitta;
		fs.periodocedolino = '>' + ultimoCedolinoStampato;
		fs.search();
		
		fs.find();
		fs.status_code = globals.RequestStatus.SUSPENDED;
		fs.newRecord();
		fs.tiporettifica = '!=' + globals.TipoRettifica.NESSUNA;
		fs.status_code = '!=' + globals.RequestStatus.CANCELED;
		fs.status_code = '!=' + globals.RequestStatus.OVERWRITTEN;
				
        if(fs.search())
        {
        	for(var r = 1; r <= fs.getSize(); r++)
        		arrRequestsToSend.push(fs.getRecord(r));
        	
        }
	}
	
	return arrRequestsToSend;
}

/**
 * @AllowToRunInFind
 * 
 * @param {Number} idDitta
 * @param {Number} periodoCedolino
 *
 * @return {Array<JSRecord<db:/ma_richieste/lavoratori_richieste>>}
 * 
 * @properties={typeid:24,uuid:"8A11EE72-DDC5-4324-9ABC-EDC82F7787FA"}
 */
function getRequestsSent(idDitta,periodoCedolino)
{
	var arrRequestsSent = [];
	
	/** @type {JSFoundset<db:/ma_richieste/lavoratori_richieste>}*/
	var fs = databaseManager.getFoundSet(globals.Server.MA_RICHIESTE,globals.Table.LAVORATORI_RICHIESTE);
	
	if(fs && fs.find())
	{
		fs.idditta = idDitta;
		fs.periodocedolino = periodoCedolino;
		fs.lavoratori_richieste_to_tab_statooperazioni.codice = [globals.RequestStatus.SENT, globals.RequestStatus.RECEIVED, globals.RequestStatus.IN_PROCESS,	globals.RequestStatus.PROCESSED,
												                 globals.RequestStatus.CANCELED, globals.RequestStatus.EXPIRED, globals.RequestStatus.OVERWRITTEN, globals.RequestStatus.OVERWRITTEN,
																 globals.RequestStatus.TO_CANCEL, globals.RequestStatus.TO_OVERWRITE];
		if(fs.search())
        {
        	for(var r = 1; r <= fs.getSize(); r++)
        		arrRequestsSent.push(fs.getRecord(r));
        	
        }
	}
	
	return arrRequestsSent;
}