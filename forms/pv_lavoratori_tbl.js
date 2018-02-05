/**
 * @param {JSForm} 	form
 * @param			params
 * @param			layoutParams
 * @param {Boolean} [isMultiple]
 * 
 * @return {JSForm}
 *
 * @properties={typeid:24,uuid:"3C2EAD88-0843-4B92-9AF2-90553BA340D9"}
 */
function setBodyElements(form, params, layoutParams, isMultiple)
{
//	form = _super.setBodyElements(form, params, layoutParams, isMultiple);
	
	/**
	 * Set the form's height accordingly to the number of rows
	 */
	if(params.iddipendenti.length < layoutParams.maxNoOfRows)
		form.getBodyPart().height =   params.iddipendenti.length * layoutParams.fieldHeight
									+ layoutParams.labelHeight 
									+ 36;	// add some space for the pager
	else
		form.getBodyPart().height =   layoutParams.maxNoOfRows * layoutParams.fieldHeight
									+ layoutParams.labelHeight 
									+ 36;	// add some space for the pager
									
	// Add 3 px to avoid displaying the horizontal scrollbar								
	form.width += 3;
	
	return form;
}

/**
 * @param {JSRenderEvent} event
 *
 * @properties={typeid:24,uuid:"D34592A6-E06D-453A-9CA5-E471C5B7EFDD"}
 */
function onRender(event)
{
	var renderable = event.getRenderable();
	if (renderable)
	{
		if(!renderable.enabled)
			renderable.bgcolor = '#cccccc';
		else
		{
			renderable.bgcolor = '#ffffff';
			renderable.fgcolor = '#434343';
		}
	}
}
