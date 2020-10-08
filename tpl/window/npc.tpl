<script id="tpl-npc-model" type="text/x-dot-template">
<div class="window" style="border: 30px solid rgba(1.0, 1.0, 1.0, 0.7);">
<div class="header">
	<span>
		Model: {@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$npc.id}
	</span>
	<div class="menu">
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div>Please choose a model:</div>
</div>
</div>

TEMPLATE_END
<style>
</style>
</script>

<script id="tpl-npc" type="text/x-dot-template">

<div class="window resizable" style="width: 305px; height: 448px;">
<div class="header">
	<span>
		{@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} #{@$npc.id}
	</span>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 8px;">
		<span style="width: 45px;">Name:</span>
		<input type="text" style="flex: 1; width: 100%;" placeholder="(unnamed)" data-link="win.npc => 'name'">
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-top: -8px">
		<div class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Type:</span>
			<select id="type" style="">
				<option value="npc">NPC</option>
				<option value="guard">Guard</option>
			</select>
		</div>
		<div class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Model:</span>
			<a class="button" data-onclick="NPCModelWindow.open({{ parent: win }});">(default)&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
	</div>
	<div class="flex-columns" style="margin-bottom: 8px; align-items: center; justify-content: space-between;">
		<div>
			<span style="margin-right: 8px;">Sell:</span>
			{assign sells = db.npc_sells[$npc.id_sell_service];}
			<a class="button" data-onclick=";">{@ $sells?._name ?? ($sells ? ($sells.name || "(unnamed)") : "(none)" ) }&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
		<div>
			<span style="margin-right: 8px;">Craft:</span>
			{assign craft = db.npc_crafts[$npc.id_make_service];}
			<a class="button" data-onclick=";">{@ $craft?._name ?? ($craft ? ($craft.name || "(unnamed)") : "(none)" ) }&nbsp;<i class="fa fa-angle-right" aria-hidden="true"></i></a>
		</div>
	</div>
	<div>Greeting:</div>
	<div style="flex: 1; padding-bottom: 18px; padding-right: 7px;">
		<textarea>{@$npc.greeting || ""}</textarea>
	</div>
</div>
</div>

TEMPLATE_END
<style>
</style>

</script>

