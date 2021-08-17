<script id="tpl-game-accounts" type="text/x-dot-template">
<div class="section">
	<div class="info">Character lists are updated every hour. If you just created a new character it might not show up here yet.</div>

	<div id="accounts" style="display: flex; flex-direction: column; row-gap: 10px; margin-top: 20px;">
		{for acc of $page.accounts}
			<div class="account customSection">
				<div style="display: flex;">
					<div>
						<div class="header">{@$acc.name}</div>
						<div>Vote Points: 0</div>
						<div>Characters:</div>
					</div>
					<div style="flex: 1"></div>
					<div style="display: flex; flex-direction: column; row-gap: 5px;">
						<a class="button" style="display: none;" href="javascript:void(0);" onclick="{serialize $page}.show_details({@$acc.accountID});">Show details</a>
						<a class="button" style="" href="javascript:void(0);" onclick="{serialize $page}.change_pass({@$acc.id});">Change password</a>
					</div>
				</div>
				<div class="details">
					<div class="roles">
						{for role of $acc.roles}
							<div class="role">
								<img class="class-icon" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
								<span class="name">{@$role.name}</span>
								<span class="class">{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. {@$role.level}</span>
								<span class="faction">Faction: {@$role.faction_name || '(none)'}</span>
							</div>
						{/for}
						{if $acc.roles.length == 0}
							<div style="color: gray;">(None)</div>
						{/if}
					</div>
				</div>
			</div>
		{/for}
	</div>

	<div style="display: flex; margin-top: 15px;">
		<div style="flex: 1"></div>
		<a class="button buttonPrimary" style="" href="javascript:void(0);" onclick="{serialize $page}.register_acc();">Register new game account</a>
	</div>


	<div id="register_acc_dialogue" style="display: none;">
		<div>Username must be 4-32 characters long.</div>
		<div>Password must be 6-32 characters long</div>

		<div style="display: flex; align-items: baseline; margin-top: 25px;">
			<div style="width: 65px;">Name:</div>
			<input type="text" name="name" style="flex: 1;" autocomplete="off">
		</div>

		<div style="display: flex; align-items: baseline; margin-top: 10px;">
			<div style="width: 65px;">Pass:</div>
			<input type="password" name="pass" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
		</div>

		<div style="display: flex; align-items: flex-end; margin-top: 5px;">
			<div style="width: 65px; line-height: 15px;">Confirm pass:</div>
			<input type="password" name="pass2" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
		</div>
	</div>

	<div id="change_pass_dialogue" style="display: none;">
		{if $account}
			<div>Password must be 6-32 characters long</div>

			<div style="display: flex; align-items: baseline; margin-top: 10px;">
				<div style="width: 65px;">Name:</div>
				<input type="text" name="name" class="disabled" value="{@$account.name}" style="flex: 1;" autocomplete="off" readonly>
			</div>

			<div style="display: flex; align-items: baseline; margin-top: 10px;">
				<div style="width: 65px;">Pass:</div>
				<input type="password" name="pass" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
			</div>

			<div style="display: flex; align-items: flex-end; margin-top: 5px;">
				<div style="width: 65px; line-height: 15px;">Confirm pass:</div>
				<input type="password" name="pass2" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
			</div>
		{/if}
	</div>

</div>

{@@
<style>
.account {
	padding: 20px;
	display: flex;
	flex-direction: column;
}

.account > .details {
	display: flex;
	flex-direction: column;
}

.account .header {
	font-size: 18px;
}

.account > .details > .roles {
	display: flex;
	flex-direction: column;
	margin-left: 10px;
	margin-top: 10px;
}

.role {
	display: flex;
	align-items: center;
	column-gap: 10px;
	padding: 4px;
	border-bottom: 1px solid rgba(224, 224, 224, 1);
}

.role:nth-child(odd) {
	background-color: #f6f6f6;
}

.role:last-child {
	border-bottom: none;
}

.role:hover {
	background-color: #e8e8e8;
}

.role .name {
	width: 140px;
}

.role .class {
	width: 160px;
}

.role .class-icon {
	width: 36px;
	height: 36px;
}

.customSection {
	border: 1px solid rgba(236, 241, 247, 1);
	background-color: rgba(255, 255, 255, 1);
	padding: 20px;
}
</style>
@@}
</script>
