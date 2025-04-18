<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (Auth::check()) {
            // Mengecek peran user
            if (Auth::user()->role != $role) {
                // Jika role tidak sesuai, redirect ke halaman yang lain
                return redirect('/unauthorized');  // Atau halaman lain yang sesuai
            }
        }

        return $next($request);
    }
}
