<script id="tpl-rmenu" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div class="window" style="display: none;">
<div class="content">
{* dummy *}
</div>
</div>

<div id="background" onclick="{serialize $win}.close();" oncontextmenu="return false;">
	<div class="menu" style="left: {@$x}px; top: {@$y}px;">
		{for e of $entries}
			<div class="entry" onclick="event.stopPropagation();{if $e.id}{serialize $win}.select({@$e.id});{/if}">
				<span>{@$e.name}</span>
				{if $e.children}
					<div style="flex: 1;"></div>
					<i class="fa fa-angle-right"></i>
					<div class="menu">
							{for c of $e.children}
								<div class="entry" onclick="{serialize $win}.select({@$c.id});">
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
	background-color: #000;
	opacity: 0.3;
	position: fixed;
	width: 100vw;
	height: 100vh;
}

.menu {
	position: absolute;
	width: min-content;
	background-color: rgb(255 230 230);
	border: solid 1px rgba(224, 176, 176, 1);
	display: flex;
	flex-direction: column;
	user-select: none;
}

.entry {
	padding: 5px;
	color: rgba(80, 44, 44, 1);
	display: flex;
	align-items: baseline;
}

.entry + .entry {
	border-top: solid 1px rgba(224, 176, 176, 1);
}

.entry:hover {
	background-color: rgba(251, 241, 241, 1);
}

.entry > .menu {
	display: none;
}

.entry:hover > .menu {
	display: block;
	right: 0;
	top: -1px;
	transform: translateX(100%);
}

.entry > .fa-angle-right {
	margin-left: 8px;
}

</style>
@@}
</script>
