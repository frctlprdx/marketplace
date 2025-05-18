<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RajaOngkirController extends Controller
{
    public function searchDestination (Request $request){
        $response = Http::withHeaders([
            'key' => config('rajaongkir.api_key'),
        ])->get('https://rajaongkir.komerce.id/api/v1/destination/domestic-destination', [
            'search' => $request->search,
            'limit' => 10,
            'offset' => 0,
        ]);

        return response()->json([
            'data' => $response->json(),
        ]);
    }
}