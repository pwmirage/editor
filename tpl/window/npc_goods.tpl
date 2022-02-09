<div class="window" style="width: 316px; height: 352px;">
<div class="header {if $goods._removed}removed{/if}">
	<span>
		Goods: {@$goods.name || ""} {@DB.serialize_id($goods.id)}
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
		<span style="width: 45px;">Name</span>
		<span data-input style="flex: 1;" data-link="{serialize $goods} => 'name'" data-placeholder="(unnamed)"></span>
	</div>
	<div class="flex-columns" style="align-items: center; margin-bottom: 5px;">
		<span style="width: 45px;">NPC option</span>
		<span data-input style="flex: 1;" data-link="{serialize $goods} => 'option'" data-placeholder="(unnamed)"></span>
	</div>
	<div style="font-size: 12px; background-color: var(--header-color); color: white; padding: 2px 8px; margin: 0 -12px; margin-bottom: 4px;">Tabs:</div>
	<div id="tabs" class="flex-columns" style="flex-wrap: wrap; margin-bottom: 4px;">
	{for i = 0; i < 8; i++}
		<span class="tabname" data-input onfocus="{serialize $win}.select({@$i});" data-link="{serialize $goods} => 'pages', {@$i}, 'title'" data-placeholder="(none)"></span>
	{/for}
	</div>
	<div id="items" class="flex-columns" style="flex-wrap: wrap;" onmousedown="return {serialize $win}.onclick(event);" oncontextmenu="return {serialize $win}.onclick(event);">
		{assign tab = $goods.pages[$win.selected_tab || 0]}
		{for i = 0; i < 32; i++}
			{assign id = $tab?.item_id ? $tab?.item_id[i] : 0}
			{assign item = db.items[$id || 0]}
			<span class="item menu-triangle" ondblclick="" data-id="{@$id}" data-idx="{@$i}" tabindex="0"><img{ } src="{@ $id ? Item.get_icon($item?.icon || 0) : (ROOT_URL + 'img/itemslot.png')}" alt=""></span>
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
	padding-right: 3px;
}

#items > * {
	width: 32px;
	height: 32px;
	position: relative;
}

#items > .item,
#items > .item > img {
	outline: none;
}

#items > .item:focus {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin: -1px;
}

.item.menu-triangle:after {
	border-color: transparent transparent #a0b2a6 transparent;
}

#items > .item:focus:before {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

</style>
@@}
