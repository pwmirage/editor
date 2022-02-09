<div class="window resizable" style="width: 350px; height: 400px;">
<div class="header {if $npc._removed}removed{/if}">
	<span>
		{if !$npc.id && $npc._db.base}
			{@(db.npcs[$npc._db.base]?.name ?? "(unknown)") || "(unnamed)"} {@DB.serialize_id($npc._db.base)}
		{else}
			{if $npc._db.base}<span style="font-weight: bold;">(f) </span>{/if}
			{@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} {@DB.serialize_id($npc.id)}
		{/if}
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
		<span data-input style="flex: 1;" data-link="{serialize $npc} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 5px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
		<div class="flex-columns" style="align-items: center;">
			<span style="width: 45px;">Type:</span>
			<span data-select="NPCWindow.types" data-link="{serialize $npc} => 'id_type'" style="width: auto; min-width: 75px; flex: 1;"></span>
		</div>
		<div id="model" class="flex-columns" style="align-items: center;">
			<span style="width: 45px;">Model:</span>
			<span data-select="db.npcs" data-select-field="file_model" data-link="{serialize $npc} => 'file_model'" style="width: auto; min-width: 100px; flex: 1;"></span>
		</div>
	</div>
	<div id="goods" class="flex-columns" style="flex-wrap: wrap; margin-bottom: 5px; align-items: center; justify-content: space-between;">
		<div>
			<span style="margin-right: 5px;">Sell:</span>
			{assign sells = db.npc_sells[$npc.id_sell_service];}
			<a class="button menu-triangle" oncontextmenu="return false;" onmousedown="{serialize $win}.edit(this, 'sells', event);" style="text-align: center;">{@ $sells ? ($sells.name || "(unnamed)") : "(none)" }</a>
		</div>
		<div>
			<span style="margin-right: 5px;">Craft:</span>
			{assign crafts = db.npc_crafts[$npc.id_make_service];}
			<a class="button menu-triangle" oncontextmenu="return false;" onmousedown="{serialize $win}.edit(this, 'crafts', event);" style="text-align: center;">{@ $crafts ? ($crafts.name || "(unnamed)") : "(none)" }</a>
		</div>
		<div>
			<a class="button" oncontextmenu="return false;" onclick="{serialize $win}.find_related_quests();" style="text-align: center;">Related quests</a>
		</div>
	</div>
	<div>Greeting:</div>
	<div class="pw-editable-color-text" style="margin-bottom: 18px;" data-editable-color-text data-link="{serialize $npc} => 'greeting'"></div>
</div>
</div>

{@@
<style>

</style>
@@}
