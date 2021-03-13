<script id="tpl-item-chooser" type="text/x-dot-template">
<div class="window" style="border: 30px solid rgba(1.0, 1.0, 1.0, 0.7); overflow: hidden; transition: none;">
<div class="header">
	<span>
		Item chooser
	</span>
	<div class="menu">
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div id="search" class="flex-columns" style="align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
		<span>Search:</span>
		<input type="text" style="flex: 1; max-width: 368px;" oninput="{serialize $win}.filter(this.value);">
		{for i = 0; i < $win.tabs.length; i++}
			{assign tab = $win.tabs[i]}
			<a class="button tab {if $win.selected_tab == $i}selected{/if}" onclick="{serialize $win}.select_tab({@$i});">{@$tab.name}</a>
		{/for}
	</div>
	<div id="items" class="flex-columns flex-gap" style="flex-wrap: wrap;" onmousemove="{serialize $win}.onmousemove(event);" onmouseleave="{serialize $win}.onmousemove(event);">
		{for i = 0; i < $win.max_items_per_page; i++}
			<span class="item" ondblclick="{serialize $win}.choose('{@$i}');" data-type="{@$i}" tabindex="0"><img src="data:," alt=""></span>
		{/for}
	</div>
	<div style="flex: 1;"></div>
	<div id="pager" style="float: right; width: auto;">
		<span style="margin-right: 10px;">{@1 + $win.pager_offset} - {@Math.min($win.pager_offset + $win.items_per_page, $win.items.length)} of {@$win.items.length}</span>
		<a class="button {@$win.pager_offset == 0 ? 'disabled' : ''}" onclick="{serialize $win}.move_pager({@-$win.items_per_page});"><i class="fa fa-angle-left" aria-hidden="true"></i></a>
		<a class="button {@$win.pager_offset + $win.items_per_page >= $win.items.length ? 'disabled' : ''}" onclick="{serialize $win}.move_pager({@$win.items_per_page});"><i class="fa fa-angle-right" aria-hidden="true"></i></a>
	</div>
	</div>
</div>
</div>

{@@
<style>
.content.loading:after {
	content: " ";
	display: block;
	position: absolute;
	top: 50px;
	left: calc(50% - 24px);
	width: 48px;
	height: 48px;
	margin: 8px;
	border-radius: 50%;
	border: 6px solid #000;
	border-color: #0a0a0a transparent #000 transparent;
	animation: loading-dual-ring 1.2s linear infinite;
}

@keyframes loading-dual-ring {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.tab.selected {
	background-color: rgba(146, 110, 110, 1);
	color: rgba(255, 255, 255, 1);
}


#items {
	margin-top: -16px;
	margin-right: -16px;
	margin-left: -12px;
	margin-bottom: -12px;
	overflow: hidden;
	padding: 12px;
	column-gap: 0;
}

#items > * {
	width: 32px;
	height: 32px;
	margin-top: 0;
	margin-right: 4px;
	position: relative;
}

#items > .item > img {
	background-color: #000;
}

#items > .item,
#items > .item > img {
	outline: none;
}

#items > .item > img {
	user-select: none;
}

#items > .item:focus {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin-left: -1px;
	margin-bottom: -1px;
	margin-top: -1px;
	margin-right: 3px;
}

#items > .item:focus:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

#item_info {
	position: fixed;
	background-color: rgba(0, 0, 0, 0.9);
	color: #fff;
}

#pager {
	padding-top: 6px;
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
}

#pager > * {
	margin-left: 5px;
}
</style>
@@}
</script>

<script id="tpl-simple-chooser" type="text/x-dot-template">
<div class="window" style="border: 30px solid rgba(1.0, 1.0, 1.0, 0.7); overflow: hidden; transition: none;">
<div class="header">
	<span>
		{@$win.title}
	</span>
	<div class="menu">
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows">
	<div id="search" class="flex-columns" style="align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
		<span>Search:</span>
		<input type="text" style="flex: 1; max-width: 368px;" oninput="{serialize $win}.filter(this.value);" value="{@$win.search}">
		{for i = 0; i < $win.tabs.length; i++}
			{assign tab = $win.tabs[i]}
			<a class="button tab {if $win.selected_tab == $i}selected{/if}" onclick="{serialize $win}.select_tab({@$i});">{@$tab.name}</a>
		{/for}
	</div>
	<div id="items" class="flex-columns flex-gap" style="flex-wrap: wrap;">
		{for i = 0; i < $win.max_items_per_page; i++}
			<a class="button" data-type="{@$i}" ondblclick="{serialize $win}.choose('{@$i}');" data-onhover="{serialize $win}.item_hover({@$i}, is_hover);"></a>
		{/for}
	</div>
	<div style="flex: 1;"></div>
	<div id="pager" style="float: right; width: auto;">
		<span style="margin-right: 10px;">{@1 + $win.pager_offset} - {@Math.min($win.pager_offset + $win.items_per_page, $win.items.length)} of {@$win.items.length}</span>
		<a class="button {@$win.pager_offset == 0 ? 'disabled' : ''}" onclick="{serialize $win}.move_pager({@-$win.items_per_page});"><i class="fa fa-angle-left" aria-hidden="true"></i></a>
		<a class="button {@$win.pager_offset + $win.items_per_page >= $win.items.length ? 'disabled' : ''}" onclick="{serialize $win}.move_pager({@$win.items_per_page});"><i class="fa fa-angle-right" aria-hidden="true"></i></a>
	</div>
	</div>
</div>
</div>

<style>
#items > a \{
	width: {@$win.args.width}px;
}

{@@
.content.loading:after {
	content: " ";
	display: block;
	position: absolute;
	top: 50px;
	left: calc(50% - 24px);
	width: 48px;
	height: 48px;
	margin: 8px;
	border-radius: 50%;
	border: 6px solid #000;
	border-color: #0a0a0a transparent #000 transparent;
	animation: loading-dual-ring 1.2s linear infinite;
}

@keyframes loading-dual-ring {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.tab.selected {
	background-color: rgba(146, 110, 110, 1);
	color: rgba(255, 255, 255, 1);
}

#items {
	margin-top: -16px;
	margin-right: -16px;
	margin-left: -12px;
	margin-bottom: -12px;
	overflow: hidden;
	padding: 12px;
}

#items > * {
	width: 100px;
	margin-top: 4px;
	margin-right: 4px;
	position: relative;
}

#items > .selected {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin-left: -1px;
	margin-bottom: -1px;
	margin-top: 3px;
	margin-right: 3px;
}

#items > .selected:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

#pager {
	padding-top: 6px;
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
}

#pager > * {
	margin-left: 5px;
}
</style>
@@}
</script>
