<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Redis;

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

    // butuh destination dan weight nya saja (migrate ulang dengan weight di produknya)
    public function countPrice(Request $request)
    {
        $response = Http::asForm()->withHeaders([
            'key' => config('rajaongkir.api_key'),
        ])->post('https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost', [
            'origin' => $request->origin,
            'destination' => $request->destination,
            'weight' => $request->weight,
            'courier' => $request->courier,
        ]);

        return response()->json([
            'data' => $response->json(),
        ]);
    }
}