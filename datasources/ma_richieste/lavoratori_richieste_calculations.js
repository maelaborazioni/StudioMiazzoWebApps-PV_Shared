/**
 * @properties={type:12,typeid:36,uuid:"71473A91-3EF1-47F6-820E-0D71DE99A48C"}
 */
function riepilogo_richiesta()
{
	var riepilogo = '';
	var fsRiep = lavoratori_richieste_to_lavoratori_richiestecampi;
	var size = fsRiep.getSize();
	for(var s = 1; s <= size; s++)
	{
		var rec = fsRiep.getRecord(s);
		riepilogo += (rec.codice + ' : ' + rec.valore);
		
		if(s < size)
			riepilogo += ',';
	}
	
	return riepilogo;
}

/**
 * @properties={type:4,typeid:36,uuid:"FF1B5769-612F-4934-A95A-53A405200E33"}
 */
function codice_ditta()
{
	return lavoratori_richieste_to_lavoratori.lavoratori_to_ditte.codice;
}

/**
 * @properties={type:4,typeid:36,uuid:"A99DDE58-9651-4DEE-8DCB-76E8449A6DE0"}
 */
function is_selected()
{
	return 0;
}

/**
 * @properties={type:4,typeid:36,uuid:"42A79C5E-BDCB-47CA-8E40-7B00F527EFDF"}
 */
function inviata()
{
	return invio_data ? 1 : 0;
}

/**
 * @properties={type:4,typeid:36,uuid:"69441F75-F78E-4AA0-AE03-69026E90C551"}
 */
function annullata()
{
	return tiporettifica == globals.TipoRettifica.ANNULLAMENTO && status_code === globals.RequestStatus.CANCELED;
}

/**
 * @properties={typeid:36,uuid:"28897F86-28CC-4A2A-83DF-92F455929A3C"}
 */
function in_annullamento()
{
	return tiporettifica == globals.TipoRettifica.ANNULLAMENTO && !annullata;
}

/**
 * @properties={type:4,typeid:36,uuid:"C83059B6-61D8-4875-8926-0FCE9AC0FE31"}
 */
function rettificata()
{
	return tiporettifica == globals.TipoRettifica.MODIFICA && status_code === globals.RequestStatus.CANCELED;
}

/**
 * @properties={typeid:36,uuid:"65D82F67-3678-4C53-A886-2A2F8F8944AF"}
 */
function in_rettifica()
{
	return tiporettifica == globals.TipoRettifica.MODIFICA && !rettificata;
}

/**
 * @properties={type:4,typeid:36,uuid:"B312EF82-A3AF-4920-92CD-313CA79E180A"}
 */
function is_delete()
{
	return (rettificaper && lavoratori_richieste_to_lavoratori_richieste_rettificate.tiporettifica === globals.TipoRettifica.ANNULLAMENTO) ? 1 : 0;
}

/**
 * @properties={type:12,typeid:36,uuid:"66262CF5-09AC-4363-9258-AE29313685DC"}
 */
function displayed_status()
{
	// Only change the status if the requests are not yet confirmed
	if(in_annullamento)
		return globals.getStatusId(globals.RequestStatus.TO_CANCEL);
	else
	if(in_rettifica)
		return globals.getStatusId(globals.RequestStatus.TO_OVERWRITE);
	else
	if(rettificata)
		return globals.getStatusId(globals.RequestStatus.OVERWRITTEN)
	else
		return idtabstatooperazione;
}

/**
 * @properties={typeid:36,uuid:"F1D6E4CF-788A-45C2-B46F-E7CDCBFCD937"}
 */
function status_code()
{
	return lavoratori_richieste_to_tab_statooperazioni.codice;
}

/**
 * @properties={type:12,typeid:36,uuid:"95EF4F3B-DBA5-4462-8A2A-E886BAD481E2"}
 */
function note_nonempty()
{
	return note || i18n.getI18NMessage('ma.msg.no_note');
}

/**
 * @properties={type:4,typeid:36,uuid:"686540DC-2514-40E8-A44A-E117F31F51E9"}
 */
function idlavoratore_cliente()
{
	return (globals.isCliente() ? lavoratori_richieste_to_v_lavoratori_cliente2sede.idlavoratorecliente : idlavoratore);
}

/**
 * @properties={type:4,typeid:36,uuid:"AE79BEF9-EF14-4112-AE75-A691D935A47D"}
 */
function idlavoratore_sede()
{
	return (globals.isCliente() ? lavoratori_richieste_to_v_lavoratori_cliente2sede.idlavoratoresede : idlavoratore);
}

/**
 * @properties={type:93,typeid:36,uuid:"F8513297-D77B-482A-9C6E-F3B289AC8EB7"}
 */
function periodo_date()
{
	return globals.toDate(periodocedolino);
}

/**
 * @properties={type:12,typeid:36,uuid:"82A18C24-86C1-4FE4-8ED4-B422536511DD"}
 */
function nominativo()
{
	return lavoratori_richieste_to_lavoratori.nominativo;
}

/**
 * @properties={type:12,typeid:36,uuid:"37725483-61D9-443F-BA6D-00A9EBE57FB4"}
 */
function codice()
{
	return lavoratori_richieste_to_lavoratori.codice;
}

/**
 * @properties={type:12,typeid:36,uuid:"1B53F65A-F1AE-4419-9D25-59C4A0F80AB1"}
 */
function richiesta()
{
	return lavoratori_richieste_to_tab_richiestedettaglio.descrizione;
}

/**
 * @properties={type:12,typeid:36,uuid:"E5CC3298-5150-4B24-8672-6CE7D087C1FD"}
 */
function regola()
{
	return lavoratori_richieste_to_tab_richiestedettagliocondizioni.descrizione;
}

/**
 * @properties={typeid:36,uuid:"E2BB4A5A-C944-40AF-A950-A0BE974C1A3E"}
 */
function idtabrichiesta()
{
	return lavoratori_richieste_to_tab_richiestedettaglio.idtabrichiesta;
}
