<div class="window resizable" style="width: 304px; min-height: 250px;">
<div class="header">
	<span>Welcome</span>
	<div class="menu">
		<i class="close fa fa-close"></i>
	</div>
</div>
<div class="content flex-rows">
	<span>Welcome to Mirage Editor. If it's your first time here it is recommended you check out the guide here: <a href="/editor/guide" class="button">Mirage Editor Guide</a></span>
	<span style="margin-top: 10px;">
		{if !WCF.User.userID}
			<span>Otherwise feel free to close this dialogue and play around with the editor, but please note saving and publishing your work will only be possible after you log in.</span>
			<div class="flex-columns" style="margin-top: 10px; column-gap: 6px;">
				<a class="button" onclick="document.querySelector('#userLogin > .loginLink').click(); document.querySelector('#returnToWebsite').click();">Login or Register</a>
			</div>
		{else}
			<span>Otherwise feel free to close this dialogue and play around with the editor :)</span>
		{/if}
	</span>
	<span style="margin-top: 10px">
	<b>The editor is still very work-in-progress.</b> Many buttons do nothing upon click - we're aware of that. They will start working eventually.
	</span>
	<div style="flex: 1;"></div>
	<center><a class="button" onclick="{serialize $win}.close();" style="margin-top: 10px;">OK</a></center>
</div>

{@@
<style>
.window {
	position: relative;
}

.window:before {
	content: '';
	width: 300vw;
	height: 300vh;
	position: absolute;
	left: -100vw;
	top: -100vh;
	background: #000;
	opacity: 0.5;
	user-events: none;
}
</style>
@@}
