<script id="tpl-npc-goods" type="text/x-dot-template">
<div class="window" style="width: 316px; height: 400px;">
<div class="header">
	<span>
		NPC Goods: {@$goods._name || "(unnamed)"} #{@$goods.id}
	</span>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<div class="flex-columns" style="align-items: center; margin-bottom: 8px;">
		<span style="width: 45px;">Name</span>
		<span data-input style="flex: 1;" data-link="{serialize $goods} => '_name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="align-items: center; margin-bottom: 8px;">
		<span style="width: 45px;">NPC option</span>
		<span data-input style="flex: 1;" data-link="{serialize $goods} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div style="font-size: 12px; background-color: var(--header-color); color: white; padding: 2px 8px; margin: 0 -12px; margin-bottom: 4px;">Tabs:</div>
	<div id="tabs" class="flex-columns" style="flex-wrap: wrap; margin-bottom: 6px;">
	{for i = 0; i < 8; i++}
		<span class="tabname" data-input onfocus="{serialize $win}.select({@$i});" data-link="{serialize $goods} => 'pages', {@$i}, 'page_title'" data-placeholder="(none)"></span>
	{/for}
	</div>
	<div id="items" class="flex-columns" style="flex-wrap: wrap;">
		{assign tab = $goods.pages[$win.selected_tab || 0]}
		{for i = 0; i < 32; i++}
			{assign id = $tab?.item_id ? $tab?.item_id[i] : 0}
			{assign item = db.items[$id || 0]}
			<span class="item" ondblclick="" data-type="{@$i}" tabindex="0"><img{ } src="{@ $id ? Item.get_icon($item?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}" alt=""></span>
		{/for}
	</div>
</div>
</div>

{@@
<style>
#tabs {
	margin-right: -8px;
	margin-top: 0px;
}

span.tabname {
	width: 57px;
	padding: 2px 4px;
	margin-right: -2px;
	margin-top: 4px;
	position:relative;
	margin-bottom: 4px;
}

span.tabname.selected {
	border-bottom: 5px solid #e0b0b0;
	margin-bottom: 0px;
}

#items {
	background-color: #000;
	gap: 4px;
	padding: 4px;
}

#items > * {
	width: 32px;
	height: 32px;
}
</style>
@@}
</script>

<script id="tpl-npc" type="text/x-dot-template">

<div class="window resizable" style="width: 350px; height: 400px;">
<div class="header">
	<span>
		{if !$npc.id && $npc._db.base}
			{@(db.npcs[$npc._db.base]?.name ?? "(unknown)") || "(unnamed)"} {@serialize_db_id($npc._db.base)}
		{else}
			{if $npc._db.base}<span style="font-weight: bold;">(f) </span>{/if}
			{@($npc?.id ? (($npc?.name ?? "(unknown)") || "(unnamed)") : "(none)")} {@serialize_db_id($npc.id)}
		{/if}
	</span>
	<div class="menu">
		<i class="fork fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa"></i>
		<i class="maximize fa"></i>
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden;">
	<div class="flex-columns" style="align-items: center; margin-bottom: 8px;">
		<span style="width: 45px;">Name:</span>
		<span data-input style="flex: 1;" data-link="{serialize $npc} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns flex-all" style="margin-bottom: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-top: -8px">
		<div class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Type:</span>
			<span data-select="NPCWindow.types" data-link="{serialize $npc} => 'id_type'" style="width: auto; min-width: 75px; flex: 1;"></span>
		</div>
		<div id="model" class="flex-columns" style="align-items: center; margin-top: 8px;">
			<span style="width: 45px;">Model:</span>
			<span data-select="NPCWindow.models" data-select-field="file" data-link="{serialize $npc} => 'file_model'" style="width: auto; min-width: 100px; flex: 1;"></span>
		</div>
	</div>
	<div id="goods" class="flex-columns" style="margin-bottom: 8px; align-items: center; justify-content: space-between;">
		<div>
			<span style="margin-right: 8px;">Sell:</span>
			{assign sells = db.npc_sells[$npc.id_sell_service];}
			<a class="button no-break menu-triangle" onmousedown="{serialize $win}.edit(this, 'goods');" style="text-align: center;">{@ $sells?._name ?? ($sells ? ($sells.name || "(unnamed)") : "(none)" ) }</a>
		</div>
		<div>
			<span style="margin-right: 8px;">Craft:</span>
			{assign craft = db.npc_crafts[$npc.id_make_service];}
			<a class="button" onclick=";">{@ $craft?._name ?? ($craft ? ($craft.name || "(unnamed)") : "(none)" ) }&nbsp;<i class="fa fa-angle-right"></i></a>
		</div>
	</div>
	<div>Greeting:</div>
	<div class="pw-editable-color-text">
		<code contenteditable="true" onkeyup="{serialize $win}.update_caret();" onmouseup="{serialize $win}.update_caret();" onpaste="setTimeout(() => {serialize $win}.save_greeting(), 1);" oninput="{serialize $win}.format_greeting();">
			{@$npc.greeting?.replace('\n', '<br>') || ""}
		</code>
		<div class="color" onclick="{serialize $win}.insert_color();" title="Add color">
			<i class="fa fa-adjust"></i>
		</div>
	</div>
</div>
</div>

{@@
<style>

</style>
@@}
</script>

