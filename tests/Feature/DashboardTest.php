<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SystemSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        SystemSettingsService::forgetCache();

        Permission::findOrCreate('panel.prosmotr', 'web');

        $user = User::factory()->create();
        $user->givePermissionTo('panel.prosmotr');

        $this->actingAs($user);

        $this->get('/dashboard')->assertOk();
    }
}
