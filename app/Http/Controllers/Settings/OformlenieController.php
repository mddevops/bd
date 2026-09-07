<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ObnovitOformlenieRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OformlenieController extends Controller
{
  public function edit(): Response
  {
    return Inertia::render('settings/appearance', [
      'nastroiki' => request()->user()?->poluchennyeNastroiki(),
    ]);
  }

  public function update(ObnovitOformlenieRequest $request): RedirectResponse
  {
    $polzovatel = $request->user();
    $polzovatel->nastroiki = array_merge(
      $polzovatel->poluchennyeNastroiki(),
      $request->validated(),
    );
    $polzovatel->save();

    return back();
  }
}
