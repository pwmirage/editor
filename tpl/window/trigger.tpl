<script id="tpl-trigger" type="text/x-dot-template">

<div class="window resizable" style="width: 300px; height: 448px;"">
<div class="header {if $trigger._removed}removed{/if}">
	<span>
		Trigger: {@$trigger.name || ''} {@DB.serialize_id($trigger.id)}
	</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 45px;">Name:</span>
		<span data-input style="flex: 1;" data-link="{serialize $trigger} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="flex-wrap: wrap;">
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span>Start delay (s):</span>
			<span data-input style="flex: 1;" class="input-number" data-link="{serialize $trigger} => 'start_delay'" data-placeholder="(0)"></span>
		</div>
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span>Automatic stop (s):</span>
			<span data-input style="flex: 1;" class="input-number" data-link="{serialize $trigger} => 'stop_delay'" data-placeholder="(none)"></span>
		</div>
		<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
			<span>Tick interval (s):</span>
			<span data-input style="flex: 1;" class="input-number" data-link="{serialize $trigger} => 'interval'" data-placeholder="(none)"></span>
		</div>
		<label><input type="checkbox" data-link="{serialize $trigger} => 'auto_start'" class="checkbox"><span>Start automatically</label>
	</div>

	<div>Spawned:</div>
	<div id="spawned">
		{assign usages = PWDB.find_usages(db, $trigger)}
		{for obj of $usages}
			{assign details = PWPreview.get_obj_type($obj)}
			<a class="button" onclick="{serialize $details.open_fn}()">{@$details.name}: {@$win.print_spawner_name($obj)}</a>
		{/foreach}
		{if $usages.length == 0}
			<span>None</span>
		{/if}
	</div>
</div>
</div>

{@@
<style>
.window > .content {
	overflow: hidden;
}

#spawned {
	overflow-y: auto;
	overflow-x: hidden;
	height: auto;
	border: 1px solid rgba(224, 176, 176, 1);
	outline: none;
	padding: 4px 8px;
}

#spawned > * {
	margin-top: 1px;
	margin-bottom: 1px;
}
</style>
@@}
</script>

