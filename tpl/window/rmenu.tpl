<script id="tpl-rmenu" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div class="window" style="display: none;">
<div class="content">
{* dummy *}
</div>
</div>

<div id="background" onclick="{serialize $win}.close();" oncontextmenu="this.onclick(); return false;" class="{if $bg}visible{/if}">
	<div class="menu" style="left: {@$x}px; top: {@$y}px;" oncontextmenu="event.stopPropagation(); return false;">
		{for e of $entries}
			{if $e.visible == false}{continue}{/if}
			<div class="entry{if $e.disabled} disabled{/if}{if !$e.id} unclickable{/if}{if !$e.id && !$e.children}text{/if}" onclick="event.stopPropagation();{if $e.id && !$e.disabled}{serialize $win}.select({@$e.id});{/if}" onmouseenter="{serialize $win}.hover_entry(this);">
				<span>{@$e.name}</span>
				{if $e.children}
					<div style="flex: 1;"></div>
					<i class="fa fa-angle-right"></i>
					<div class="menu">
							{for c of $e.children}
								{if $c.visible == false}{continue}{/if}
								<div class="entry {if $c.disabled}disabled{/if}{if !$c.id} unclickable{/if}{if !$c.id && !$c.children} text{/if}" onclick="{serialize $win}.select({@$c.id});" onmouseenter="{serialize $win}.hover_entry(this);">
									<span>{@$c.name}</span>
								</div>
							{/for}
					</div>
				{/if}
			</div>
		{/for}
	</div>
</div>

{@@
<style>
#background:before {
	content: '';
	opacity: 0.3;
	position: fixed;
	width: 100vw;
	height: 100vh;
}

#background.visible:before {
	background-color: #000;
}

.menu {
	position: absolute;
	width: min-content;
	background-color: #e6dbdb;
	display: flex;
	flex-direction: column;
	user-select: none;
	font-size: 12px;
	border-radius: 2px;
	border-top-left-radius: 0;
	z-index: 2;
}

#background > .menu {
	color: rgba(80, 44, 44, 1);
	font-style: normal;
	cursor: pointer;
	font-weight: bold;
}

.menu:before {
	content: '';
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: #e6dbdb;
	box-shadow: 0px 0px 2px black;
	z-index: -1;
}

.entry {
	padding: 8px;
	display: flex;
	align-items: baseline;
	white-space: pre;
}

.entry.text {
	background-color: #c5c3c3 !important;
	color: #5a3838 !importat;
	padding: 3px 8px;
	align-self: flex-end;
}

.entry.text > span {
	margin-left: auto;
}

.entry.disabled {
	font-style: italic;
	color: #9c9494;
}

.entry.hovered {
	background-color: #fbe5e5;
}

.entry > .menu {
	display: none;
	z-index: 2;
}

.entry.hovered > .menu {
	display: block;
	left: 100%;
	margin-top: -8px;
	margin-left: 1px;
	z-index: 1;
}

.entry > .fa-angle-right {
	margin-left: 8px;
}

</style>
@@}
</script>
