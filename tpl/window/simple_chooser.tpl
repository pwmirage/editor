<div class="window {if !$win.args.maximized}resizable{/if}" style="{if $win.args.maximized}border: 30px solid rgba(1.0, 1.0, 1.0, 0.7);{/if} overflow: hidden; transition: none; width: 414px; height: 515px; min-height: 210px;">
<div class="header">
	<span>
		{@$win.title}
	</span>
	<div class="menu">
		{if !$win.args.maximized}
			<i class="minimize fa"></i>
			<i class="maximize fa"></i>
		{/if}
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content flex-rows" style="overflow: hidden;">
	<div style="position: relative;">
		<div id="search" class="flex-columns" style="align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
			<div style="display: flex; align-items: baseline; column-gap: 6px;">
				<span>Search:</span>
				<input type="text" style="flex: 1; max-width: 368px;" oninput="{serialize $win}.filter(this.value);" value="{@$win.search}" tabindex="1">
			</div>
			{for i = 0; i < $win.tabs.length; i++}
				{assign tab = $win.tabs[i]}
				<a class="button tab {if $win.selected_tab == $i}selected{/if}" onclick="{serialize $win}.select_tab({@$i});">{@$tab.name}</a>
			{/for}
		</div>
		<div id="items" class="flex-columns flex-gap" style="flex-wrap: wrap;">
			{for i = 0; i < $win.max_items_per_page; i++}
				<a class="button" data-type="{@$i}" onclick="{serialize $win}.click('{@$i}');" ondblclick="{serialize $win}.choose('{@$i}');" tabindex="{@$i + 100}" onkeydown="if (event.key === 'Enter') {serialize $win}.choose('{@$i}');">
					{assign item = $win.items[$win.pager_offset + $i]}
					{if $item}
						{@$win.name_fn($item)}
					{/if}
				</a>
			{/for}
		</div>
	</div>

	<div id="pager" style="position: absolute; bottom: 0; right: 0; padding-right: 20px; padding-bottom: 10px; background: #fafafa; width: 100%; ">
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
	overflow: hidden;
	position: relative;
}

#items > *:empty {
	display: none;
}

#items > * > .icon-container {
	display: flex;
	align-items: center;
	column-gap: 4px;
	padding: 3px 0;
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
